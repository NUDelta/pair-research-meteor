import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { Accounts } from 'meteor/accounts-base';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/stevezhu:lodash';

import {
  Groups,
  DefaultRoles,
} from './groups.js';
import { Affinities } from '../affinities/affinities.js';
import { Tasks } from '../tasks/tasks.js';
import { DEMO_GROUP_CREATOR } from '../users/users.js';

import { EMAIL_ADDRESS } from '../constants.js';
import { Schema } from '../schema.js';
import { log } from '../logs.js';

// make private?
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
    roleTitle: {
      type: String
    },
    isAdmin: {
      type: Boolean
    },
    isPending: {
      type: Boolean
    }
  }).validator(),
  run({ groupId, userId, roleTitle, isAdmin, isPending }) {
    // TODO: validate users making changes
    const group = Groups.findOne(groupId);
    const user = Meteor.users.findOne(userId);

    // TODO: this needs to go back in hmm...
    if (!group.containsRole(roleTitle)) {
      throw new Meteor.Error('invalid-role', 'The specified role isn\'t allowed for this group.');
    }
    if (group.containsMember(user._id)) {
      throw new Meteor.Error('existing-user', 'The specified user can\'t be invited, since he/she is already in the group.');
    }

    const role = group.getRoleInfo(roleTitle);
    const taskRecord = Tasks.findOne({ userId, groupId });
    if (!taskRecord) {
      Tasks.insert({
        name: user.profile.fullName,
        userId, groupId,
        task: ''
      });
    }
    const userMembership = { groupId, role, groupName: group.groupName, isAdmin, isPending };
    const groupMembership = { fullName: user.profile.fullName, userId: userId, role, isAdmin, isPending };
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
    roleTitle: {
      type: String,
      optional: true
    },
    isAdmin: {
      type: Boolean,
      optional: true
    },
    isPending: {
      type: Boolean,
      optional: true
    }
  }).validator(),
  run({ groupId, userId, roleTitle, isAdmin = 0, isPending = 0 }) {
    // TODO: some validation for security here
    if (!this.isSimulation) {
      const group = Groups.findOne(groupId);
      const user = Meteor.users.findOne(userId);

      const groupMembershipIndex = group.getMembershipIndex(userId);
      const userMembershipIndex = user.getMembershipIndex(groupId);

      if (groupMembershipIndex === -1 || userMembershipIndex === -1) {
        throw new Meteor.Error('invalid-user', 'The user isn\'t in the specified group.');
      }
      if (roleTitle) {
        const role = group.getRoleInfo(roleTitle);
        if (!role) {
          throw new Meteor.Error('invalid-role', 'This role isn\'t allowed for this group.');
        }
        group.members[groupMembershipIndex].role = role;
        user.groups[userMembershipIndex].role = role;
      }
      // HACK: for preventing setting this if not passed in...hm...
      if (isAdmin !== 0) {
        group.members[groupMembershipIndex].isAdmin = isAdmin;
        user.groups[userMembershipIndex].isAdmin = isAdmin;
      }
      if (isPending !== 0) {
        group.members[groupMembershipIndex].isPending = isPending;
        user.groups[userMembershipIndex].isPending = isPending;
      }

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
    },
    roleTitle: {
      type: String
    }
  }).validator(),
  run({ groupId, roleTitle }) {
    if (!this.isSimulation) {
      const group = Groups.findOne(groupId);
      const membership = group.getMembership(this.userId);
      if (!membership) {
        throw new Meteor.Error('no-invite', 'You\'re not invited to this group.');
      }
      updateMembership.call({ groupId, roleTitle, userId: this.userId, isPending: false });
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
      type: Array,
      minCount: 1
    },
    'roles.$': {
      type: Schema.GroupRole
    }
  }).validator(),
  run({ groupId, roles }) {
    // TODO: update corresponding user fields + member fields
    const group = Groups.findOne(groupId);

    // update group membership
    let changedMembers = [];
    const groupMembers = _.map(group.members, member => {
      const role = _.find(roles, role => role._id == member.role._id);
      // unless no change was made
      if (!(role && role.title == member.role.title)) {
        if (role) {
          member.role = role;
        } else {
          member.role = roles[0];
        }
        changedMembers.push(member.userId);
      }
      return member;
    });

    // TODO: compare this with two mass updates (e.g. pull and addToSet)
    if (!this.isSimulation) {
      Meteor.users.find({ _id: { $in: changedMembers } }).forEach(user => {
        const index = user.getMembershipIndex(groupId);
        const role = _.find(roles, role => role._id == user.groups[index].role._id);
        if (!(role && role.title == user.groups[index].role.title)) {
          if (role) {
            user.groups[index].role = role;
          } else {
            user.groups[index].role = roles[0];
          }
          Meteor.users.update(user._id, { $set: { groups: user.groups } });
        }
      });
    }

    return Groups.update(groupId, {
      $set: {
        roles,
        members: groupMembers
      }
    });
  }
});

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
    creatorRole: {
      type: String,
      optional: true
    },
    roleTitles: {
      type: Array,
      optional: true
    },
    'roleTitles.$': {
      type: String
    },
    publicJoin: {
      type: Boolean
    },
    allowGuests: {
      type: Boolean
    }
  }).validator(),
  run({ groupName, description, creatorId, creatorRole, roleTitles, publicJoin, allowGuests }) {
    const creatorName = Meteor.users.findOne(creatorId).profile.fullName;
    const groupId = Groups.insert({ groupName, description, creatorId, creatorName, roles: roleTitles, publicJoin, allowGuests,
        creationDate: new Date() });

    const group = Groups.findOne(groupId);
    const roleTitle = creatorRole || group.roles[0].title;
    addToGroup.call({ groupId, userId: creatorId, roleTitle, isAdmin: true, isPending: false });
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
    roleTitles: {
      type: Array,
      optional: true
    },
    'roleTitles.$': {
      type: String
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
    'members.$.roleTitle': {
      type: String
    },
    'members.$.isAdmin': {
      type: Boolean
    },
    creatorRole: {
      type: String,
      optional: true
    },
  }).validator(),
  run({ groupName, description, roleTitles, publicJoin, allowGuests, members, creatorRole }) {
    const groupId = createGroup.call({ groupName, description, creatorId: this.userId, roleTitles, publicJoin, allowGuests, creatorRole });
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
    'member.roleTitle': {
      type: String
    },
    'member.isAdmin': {
      type: Boolean
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
        const group = Groups.findOne(groupId);
        addToGroup.call({ groupId: groupId, userId: user._id, roleTitle: member.roleTitle, isAdmin: member.isAdmin, isPending: true });
        Email.send({
          from: EMAIL_ADDRESS,
          to: member.email,
          subject: `You're invited to join ${ group.groupName } for Pair Research`,
          html: `To join this pair research pool, just <a href="${ Meteor.absoluteUrl() }login">log into your Pair Research account.</a> `
        });
      } else {
        const newUserId = Accounts.createUser({ email: member.email, profile: { fullName: member.email } });
        addToGroup.call({ groupId: groupId, userId: newUserId, roleTitle: member.roleTitle, isAdmin: member.isAdmin, isPending: true });
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
    Meteor.users.update(userId, { $pull : { groups: { groupId } } });
    return Groups.update(groupId, { $pull: { members: { userId } } });
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

export const createDemoGroup = new ValidatedMethod({
  name: 'groups.createDemo',
  validate: null,
  run() {
    const randomGroupName = Math.random().toString(36).slice(2);
    return Groups.insert({ 
      groupName: randomGroupName,
      description: 'A demo pair research group',
      creatorId: DEMO_GROUP_CREATOR,
      creatorName: 'Demo Admin',
      creationDate: new Date(),
      roles: _.map(_.values(DefaultRoles), title => { return { title }; }),
      publicJoin: true,
      allowGuests: true
    });
  }
});
