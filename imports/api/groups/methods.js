import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Accounts } from 'meteor/accounts-base';
import { _ } from 'meteor/stevezhu:lodash';

import { Groups, DefaultRoles } from './groups.js';
import { Affinities } from '../affinities/affinities.js';
import { Tasks } from '../tasks/tasks.js';
import { DEMO_GROUP_CREATOR } from '../users/users.js';

import { Schema } from '../schema.js';
import { log } from '../logs.js';

export const findGroupMembers = new ValidatedMethod({
  name: 'groups.findMembers',
  validate: new SimpleSchema({
    groupId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),
  run({ groupId }) {
    return Meteor.users.find({ groups: { $elemMatch: { groupId: groupId } } });
  }
});

export const addToGroup = new ValidatedMethod({
  name: 'groups.add',
  validate: new SimpleSchema({
    groupId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    userId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    role: {
      type: Schema.GroupRole,
      optional: true
    }
  }).validator(),
  run({ groupId, userId, role = DefaultRoles.Member }) {
    // TODO: consider moving some of this to users?
    // TODO: validate users making changes
    const group = Groups.findOne(groupId);
    const user = Meteor.users.findOne(userId);
    const taskRecord = Tasks.findOne({ userId, groupId });
    const userMembership = { groupId, role, groupName: group.groupName };
    const groupMembership = { fullName: user.profile.fullName, userId: userId, role };
    if (!taskRecord) {
      Tasks.insert({
        name: user.profile.fullName,
        userId, groupId,
        task: ''
      });
    }
    Groups.update(groupId, { $addToSet: { members: groupMembership }});
    Meteor.users.update(userId, { $addToSet: { groups: userMembership }});
  }
});

export const updateMembership = new ValidatedMethod({
  name: 'groups.change.member',
  validate: new SimpleSchema({
    groupId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    userId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    role: {
      type: Schema.GroupRole
    }
  }).validator(),
  run({ groupId, userId, role }) {
    // TODO: some validation for security here
    if (!this.isSimulation) {
      const group = Groups.findOne(groupId);
      const user = Meteor.users.findOne(userId);

      const groupMembershipIndex = _.findIndex(group.members, member => member.userId == userId);
      const userMembershipIndex = _.findIndex(user.groups, group => group.groupId == groupId);

      if (groupMembershipIndex === -1 || userMembershipIndex === -1) {
        throw new Meteor.Error('no-matching-membership', 'The user isn\'t in the specified group.');
      }
      if (!_.some(group.roles, role)) {
        throw new Meteor.Error('invalid-role', 'This role isn\'t allowed for this group.');
      }

      group.members[groupMembershipIndex].role = role;
      user.groups[userMembershipIndex].role = role;

      Groups.update(group._id, { $set: { members: group.members } });
      Meteor.users.update(user._id, { $set: { groups: user.groups } });
    }
  }
});

export const updateGroupInfo =  new ValidatedMethod({
  name: 'groups.info.update',
  validate: new SimpleSchema({
    groupId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    groupName: {
      type: String
    },
    description: {
      type: String
    },
    publicJoin: {
      type: Boolean
    },
    allowGuests: {
      type: Boolean
    }
  }).validator(),
  run({ groupId, groupName, description, publicJoin, allowGuests }) {
    // TODO: validate who's doing this!
    return Groups.update(groupId, {
      $set: {
        groupName, description, publicJoin, allowGuests
      }
    });
  }
});

// TODO: this should probably be private?
export const createGroup = new ValidatedMethod({
  name: 'groups.create',
  validate: new SimpleSchema({
    groupName: {
      type: String
    },
    description: {
      type: String
    },
    creatorId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    roles: {
      type: Array,
      optional: true
    },
    'roles.$': {
      type: Schema.GroupRole
    },
    publicJoin: {
      type: Boolean
    },
    allowGuests: {
      type: Boolean
    }
  }).validator(),
  run({ groupName, description, creatorId, roles, publicJoin, allowGuests }) {
    const creatorName = Meteor.users.findOne(creatorId).profile.fullName;
    const groupId = Groups.insert({ groupName, description, creatorId, creatorName, roles, publicJoin, allowGuests,
        creationDate: new Date() });
    addToGroup.call({ groupId: groupId, userId: creatorId, role: DefaultRoles.Admin });
    return groupId;
  }
});

export const createGroupWithMembers = new ValidatedMethod({
  name: 'groups.create.withMembers',
  validate: new SimpleSchema({
    groupName: {
      type: String
    },
    description: {
      type: String
    },
    roles: {
      type: Array,
      optional: true
    },
    'roles.$': {
      type: Schema.GroupRole
    },
    publicJoin: {
      type: Boolean
    },
    allowGuests: {
      type: Boolean
    },
    members: {
      type: Array,
      regEx: SimpleSchema.RegEx.Email
    },
    'members.$': {
      type: Object
    },
    'members.$.email': {
      type: String,
      regEx: SimpleSchema.RegEx.Email
    },
    'members.$.role': {
      type: Schema.GroupRole
    }
  }).validator(),
  run({ groupName, description, roles, publicJoin, allowGuests, members }) {
    const groupId = createGroup.call({ groupName, description, creatorId: this.userId, roles, publicJoin, allowGuests });
    // TODO: do things with included member role later
    members.forEach(member => inviteToGroup.call({ groupId, member }));
    return groupId;
  }
});

export const inviteToGroup = new ValidatedMethod({
  name: 'groups.invite',
  validate: new SimpleSchema({
    member: {
      type: Object
    },
    'member.email': {
      type: String,
      regEx: SimpleSchema.RegEx.Email
    },
    'member.role': {
      type: Schema.GroupRole
    },
    groupId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),
  run({ member, groupId }) {
    if (!this.isSimulation) {
      const user = Accounts.findUserByEmail(member.email);
      if (user) {
        addToGroup.call({ groupId: groupId, userId: user._id, role: DefaultRoles.Pending });
      } else {
        // TODO: this needs changing? (namely the fullName part
        const newUserId = Accounts.createUser({ email: member.email, profile: { fullName: member.email } });
        addToGroup.call({ groupId: groupId, userId: newUserId, role: member.role });
        Accounts.sendEnrollmentEmail(newUserId, member.email);
      }
    }
  }
});

export const removeFromGroup = new ValidatedMethod({
  name: 'groups.remove',
  validate: Schema.GroupUserQuery.validator(),
  run({ groupId, userId }) {
    Affinities.remove({
      groupId: groupId,
      $or: [
        { helperId: userId },
        { helpeeId: userId }
      ]
    });
    Tasks.remove({ groupId: groupId, userId: userId });
    Meteor.users.update(userId, { $pull : { groups: { groupId: groupId } } });
    return Groups.update(groupId, { $pull: { members: { userId: userId } } });
  }
});

export const clearGroupPool = new ValidatedMethod({
  name: 'groups.clearPool',
  validate: new SimpleSchema({
    groupId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),
  run({ groupId }) {
    Affinities.remove({ groupId: groupId });
    Tasks.remove({ groupId: groupId });
    Groups.update(groupId, { $unset: { activePairing: '' }});
  }
});

export const createRandomGroup = new ValidatedMethod({
  name: 'groups.createRandom',
  validate: null,
  run() {
    const randomGroupName = Math.random().toString(36).slice(2);
    return createGroup.call({
      groupName: randomGroupName,
      creatorId: this.userId
    });
  }
});

export const createDemoGroup = new ValidatedMethod({
  name: 'groups.createDemo',
  validate: null,
  run() {
    // TODO: replace with random lol
    const randomGroupName = Math.random().toString(36).slice(2);
    return Groups.insert({ 
      groupName: randomGroupName,
      description: 'A demo pair research group',
      creatorId: DEMO_GROUP_CREATOR,
      creatorName: 'Demo Admin',
      creationDate: new Date(),
      roles: _.values(DefaultRoles),
      publicJoin: true,
      allowGuests: true
    });
  }
});
