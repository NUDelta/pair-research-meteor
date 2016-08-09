import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { Accounts } from 'meteor/accounts-base';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'lodash';

import {
  Groups,
  GroupOperationHelper,
  DefaultRoles,
} from './groups.js';
import { Affinities } from '../affinities/affinities.js';
import { Tasks } from '../tasks/tasks.js';
import { DEMO_GROUP_CREATOR } from '../users/users.js';

import { EMAIL_ADDRESS } from '../constants.js';
import { Schema } from '../schema.js';
import { Auth, AuthMixin, verifyGroup, verifyUser } from '../authentication.js';
import { log } from '../logs.js';

/*
  TODO: Prob should factor out a new collection "Memberships"
  Although users won't have a ton of groups and groups likely won't have a ton
  of members, doing many array operations on updates is starting to be a pain...
*/

/**
 * @summary Adds a user to the group.
 * @exports
 * @isMethod true
 */
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
  mixins: [AuthMixin],
  allow: [Auth.GroupAdmin],
  run({ groupId, userId, roleTitle, isAdmin, isPending }) {
    const group = verifyGroup(groupId);
    const user = verifyUser(userId);

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

/**
 * Makes updates to memberships via an array of changes per member. This function throws errors as
 * soon as it encounters them, but all preceding changes in membership will be saved.
 * @exports
 * @isMethod true
 */
export const updateMembers = new ValidatedMethod({
  name: 'groups.member.update.multiple',
  validate: new SimpleSchema({
    groupId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    changes: {
      type: Array
    },
    'changes.$': {
      type: Object
    },
    'changes.$.userId': {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    'changes.$.roleTitle': {
      type: String,
      optional: true
    },
    'changes.$.isAdmin': {
      type: Boolean,
      optional: true
    },
    'changes.$.isPending': {
      type: Boolean,
      optional: true
    }
  }).validator(),
  mixins: [AuthMixin],
  allow: [Auth.GroupAdmin],
  run({ groupId, changes }) {
    const group = verifyGroup(groupId);
    if (!this.isSimulation) {
      const operations = new GroupOperationHelper(group);
      changes.forEach(change => {
        const user = verifyUser(change.userId);
        operations.setUser(user);
        if (!_.isUndefined(change.roleTitle)) {
          operations.setRole(change.roleTitle);
        }
        if (!_.isUndefined(change.isPending)) {
          operations.setPending(change.isPending);
        }
        if (!_.isUndefined(change.isAdmin)) {
          operations.setAdmin(change.isAdmin);
        }
        operations.pushMember();
      });
      operations.pushGroup();
    }
  }
});

/**
 * Promotes or demotes admins in group. This method is separated out because it requires different
 * permissions than changing role or upgrading from Pending.
 * @exports
 * @isMethod true
 */
export const setAdmin = new ValidatedMethod({
  name: 'groups.member.setAdmin',
  validate: new SimpleSchema({
    groupId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    userId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    isAdmin: {
      type: Boolean
    }
  }).validator(),
  mixins: [AuthMixin],
  allow: [Auth.GroupAdmin],
  run({ groupId, userId, isAdmin }) {
    const group = verifyGroup(groupId);
    const user = verifyUser(userId);

    if (!isAdmin && group.admins().length === 1) {
      throw new Meteor.Error('needs-one-admin', 'Your group must have at least one admin.');
    }

    const operations = new GroupOperationHelper(group, user);
    operations.setAdmin(isAdmin);
    operations.pushAll();
  }
});

/**
 * Makes changes to a single member's group membership. Can be called by either the member him/herself
 * or a group admin.
 * @exports
 * @isMethod true
 */
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
  mixins: [AuthMixin],
  allow: [Auth.GroupAdmin, Auth.GroupSelf],
  run({ groupId, userId, roleTitle, isAdmin, isPending }) {
    if (!this.isSimulation) {
      const group = verifyGroup(groupId);
      const user = verifyUser(userId);

      const operations = new GroupOperationHelper(group, user);

      if (!_.isUndefined(roleTitle)) {
        operations.setRole(roleTitle);
      }
      if (!_.isUndefined(isPending)) {
        operations.setPending(isPending);
      }
      operations.pushAll();

      // Do this after otherwise result will be overwritten
      if (!_.isUndefined(isAdmin)) {
        setAdmin.run.call(this, { groupId, userId, isAdmin });
      }
    }
  }
});

/**
 * @summary Upgrades to a normal membership from pending.
 * @exports
 * @isMethod true
 */
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
  mixins: [AuthMixin],
  allow: [Auth.GroupMember],
  run({ groupId, roleTitle }) {
    if (!this.isSimulation) {
      updateMembership.run.call(this, { groupId, roleTitle, userId: this.userId, isPending: false });
    }
  }
});

/**
 * @summary Updates a groups basic information and settings.
 * @exports
 * @isMethod true
 */
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
  mixins: [AuthMixin],
  allow: [Auth.GroupAdmin],
  run({ groupId, groupName, description, publicJoin, allowGuests }) {
    return Groups.update(groupId, {
      $set: {
        groupName, description, publicJoin, allowGuests
      }
    });
  }
});

/**
 * Updates a groups set of allowed roles. Members with a matching role id will also have their membership
 * updated. If a role is removed, the affected members will have their role reset.
 * @exports
 * @isMethod true
 * @todo Update data in history? Behavior is unclear right now.
 * @todo Determine most efficient method of mass user membership update. (e.g. forEach user or pull
 *       from all members and addToSet back)
 */
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
  mixins: [AuthMixin],
  allow: [Auth.GroupAdmin],
  run({ groupId, roles }) {
    const group = verifyGroup(groupId);

    // Update user group membership
    let changedMembers = [];
    const groupMembers = _.map(group.members, member => {
      const role = _.find(roles, role => role._id == member.role._id);
      // Unless no change was made
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

/**
 * @summary Creates a group.
 * @exports
 * @isMethod true
 */
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
  mixins: [AuthMixin],
  allow: [Auth.LoggedIn],
  run({ groupName, description, creatorId, creatorRole, roleTitles, publicJoin, allowGuests }) {
    const creatorName = Meteor.users.findOne(creatorId).profile.fullName;
    const groupId = Groups.insert({ groupName, description, creatorId, creatorName, roles: roleTitles, publicJoin, allowGuests,
        creationDate: new Date() });

    const group = Groups.findOne(groupId);
    const roleTitle = creatorRole || group.roles[0].title;
    addToGroup.run.call(this, { groupId, userId: creatorId, roleTitle, isAdmin: true, isPending: false });
    return groupId;
  }
});

/**
 * @summary Creates a group with the current user as an admin and with members.
 * @exports
 * @isMethod true
 */
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
  mixins: [AuthMixin],
  allow: [Auth.LoggedIn],
  run({ groupName, description, roleTitles, publicJoin, allowGuests, members, creatorRole }) {
    const groupId = createGroup.run.call(this, { groupName, description, creatorId: this.userId, roleTitles, publicJoin, allowGuests, creatorRole });
    members.forEach(member => inviteToGroup.run.call(this, { groupId, member }));
    return groupId;
  }
});

/**
 * Invites a user to the group. Sends an enrollment email if the user hasn't yet registered an account.
 * @exports
 * @isMethod true
 * @todo Multiple enrollment emails override the previous email tokens. Write a custom function for
 *       future emails that avoids this.
 * @see https://trello.com/c/J3vSwtg7/107-repeat-enrollment-emails-overwrite-previous-email-tokens
 */
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
  mixins: [AuthMixin],
  allow: [Auth.GroupAdmin],
  run({ member, groupId }) {
    if (!this.isSimulation) {
      const user = Accounts.findUserByEmail(member.email);
      if (user) {
        const group = Groups.findOne(groupId);
        addToGroup.run.call(this, { groupId: groupId, userId: user._id, roleTitle: member.roleTitle, isAdmin: member.isAdmin, isPending: true });
        if (user.isActive()) {
          Email.send({
            from: EMAIL_ADDRESS,
            to: member.email,
            subject: `You're invited to join ${ group.groupName } for Pair Research`,
            html: `To join this pair research pool, just <a href="${ Meteor.absoluteUrl() }login">log into your Pair Research account.</a> `
          });
        } else {
          // TODO: replace this with a custom function so as to not overwrite tokens in previous emails
          Accounts.sendEnrollmentEmail(user._id);
        }
      } else {
        const newUserId = Accounts.createUser({ email: member.email, profile: { fullName: member.email } });
        addToGroup.run.call(this, { groupId: groupId, userId: newUserId, roleTitle: member.roleTitle, isAdmin: member.isAdmin, isPending: true });
        Accounts.sendEnrollmentEmail(newUserId, member.email);
      }
    }
  }
});

/**
 * Removes a user from the group. Admins cannot be removed.
 * @exports
 * @isMethod true
 */
export const removeFromGroup = new ValidatedMethod({
  name: 'groups.remove',
  validate: Schema.GroupUserQuery.validator(),
  mixins: [AuthMixin],
  allow: [Auth.GroupAdmin, Auth.GroupSelf],
  run({ groupId, userId }) {
    const group = verifyGroup(groupId);
    if (group.isAdmin(userId)) {
      throw new Meteor.Error('user-is-admin',
        'The user could not be removed from the group, because he/she is an admin');
    }

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

/**
 * @summary Clears the pair research pool.
 * @exports
 * @isMethod true
 */
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

/**
 * @summary Creates a demo pair research group that doesn't require logged in users.
 * @todo Logged in users can't participate in demo pools at all right now? (unconfirmed, investigate).
 */
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
