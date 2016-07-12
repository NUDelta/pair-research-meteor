import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Accounts } from 'meteor/accounts-base';
import { _ } from 'meteor/stevezhu:lodash';

import {
  Groups,
  DefaultRoles,
  RoleWeight
} from './groups.js';
import { Affinities } from '../affinities/affinities.js';
import { Tasks } from '../tasks/tasks.js';
import { DEMO_GROUP_CREATOR } from '../users/users.js';

import { Schema } from '../schema.js';
import { log } from '../logs.js';

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
      type: Schema.GroupRole
    }
  }).validator(),
  run({ groupId, userId, role }) {
    // TODO: consider moving some of this to users?
    // TODO: validate users making changes
    const group = Groups.findOne(groupId);
    const user = Meteor.users.findOne(userId);

    // TODO: this needs to go back in hmm...
    // if (!group.containsRole(role)) {
    //   throw new Meteor.Error('invalid-role', 'The specified role isn\'t allowed for this group.');
    // }
    if (group.containsMember(user._id)) {
      throw new Meteor.Error('invalid-user', 'The specified user can\'t be invited, since he/she is already in the group.');
    }

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
  name: 'groups.member.update',
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

      const groupMembershipIndex = group.getMembershipIndex(userId);
      const userMembershipIndex = _.findIndex(user.groups, group => group.groupId == groupId);

      if (groupMembershipIndex === -1 || userMembershipIndex === -1) {
        throw new Meteor.Error('invalid-user', 'The user isn\'t in the specified group.');
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

export const acceptInvite = new ValidatedMethod({
  name: 'groups.member.accept',
  validate: new SimpleSchema({
    groupId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),
  run({ groupId }) {
    if (!this.isSimulation) {
      const group = Groups.findOne(groupId);
      const membership = group.getMembership(this.userId);
      if (!membership) {
        throw new Meteor.Error('no-invite', 'You\'re not invited to this group.');
      }
      const title = membership.role.title;
      const role = group.getRoleFromTitle(title);
      if (!role) {
        // TODO: fix me!!!
        throw new Meteor.Error('invalid-role', 'The role that you were invited for doesn\'t exist anymore. Please contact the group admin and have them reinvite you.');
      }
      updateMembership.call({ groupId, role, userId: this.userId });
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

export const updateGroupRoles = new ValidatedMethod({
  name: 'groups.roles.update',
  validate: new SimpleSchema({
    groupId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    roles: {
      type: Array
    },
    'roles.$': {
      type: Schema.GroupRole
    }
  }).validator(),
  run({ groupId, roles }) {
    // TODO: update corresponding user fields + member fields
    return Groups.update(groupId, {
      $set: {
        roles
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
    if (roles) {
      // HACK: need some ability to select own role
      const role = {
        title: roles[0].title,
        weight: RoleWeight.Admin
      };
      addToGroup.call({ groupId, userId: creatorId, role });
    } else {
      addToGroup.call({ groupId, userId: creatorId, role: DefaultRoles.Admin });
    }
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
    const pendingRole = _.clone(member.role);
    pendingRole.weight = RoleWeight.Pending;

    if (!this.isSimulation) {
      const user = Accounts.findUserByEmail(member.email);
      if (user) {
        addToGroup.call({ groupId: groupId, userId: user._id, role: pendingRole });
      } else {
        const newUserId = Accounts.createUser({ email: member.email, profile: { fullName: member.email } });
        addToGroup.call({ groupId: groupId, userId: newUserId, role: pendingRole });
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
