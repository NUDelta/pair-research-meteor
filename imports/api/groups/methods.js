import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Accounts } from 'meteor/accounts-base';

import { Groups } from './groups.js';
import { Affinities } from '../affinities/affinities.js';
import { Tasks } from '../tasks/tasks.js';
import { DEMO_GROUP_CREATOR, Roles } from '../users/users.js';

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
      type: Number,
      allowedValues: [ Roles.Admin, Roles.Member, Roles.Pending ],
      optional: true
    }
  }).validator(),
  run({ groupId, userId, role = Roles.Member }) {
    const user = Meteor.users.findOne(userId);
    const taskRecord = Tasks.findOne({ userId: userId, groupId: groupId });
    const membership = {
      groupId: groupId,
      role: role
    };
    if (!taskRecord) {
      Tasks.insert({
        name: user.profile.fullName,
        userId: userId,
        task: '',
        groupId: groupId
      });
    }
    return Meteor.users.update(userId, { $addToSet: { groups: membership }});
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
    addToGroup.call({ groupId: groupId, userId: creatorId, role: Roles.Admin });
    return groupId;
  }
});

// TODO: probably move this to group or users
Schema.Member = new SimpleSchema({
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  role: {
    type: Schema.GroupRole
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
    creatorName: {
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
      type: Schema.Member
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
      type: Schema.Member
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
        addToGroup.call({ groupId: groupId, userId: user._id, role: Roles.Pending });
      } else {
        // TODO: this needs changing!!
        const newUserId = Accounts.createUser({ email: member.email, profile: { fullName: 'testUser' } });
        addToGroup.call({ groupId: groupId, userId: newUserId, role: member.role.weight });
        Accounts.sendEnrollmentEmail(newUserId, member.email); // TODO: setup enrollment and email
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
    return Meteor.users.update(userId, { $pull : { groups: { groupId: groupId }}});
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
    return Groups.insert({ groupName: randomGroupName, creatorId: DEMO_GROUP_CREATOR });
  }
});
