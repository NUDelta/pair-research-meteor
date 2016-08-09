import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Random } from 'meteor/random';
import { check, Match } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'lodash';

import { Schema } from '../schema.js';
import { Tasks } from '../tasks/tasks.js';
import { Affinities } from '../affinities/affinities.js';
import { log } from '../logs.js';

/**
 * @summary Constructor for the Groups collection.
 * @class
 */
class GroupCollection extends Mongo.Collection {
  insert(group, callback) {
    return super.insert(group, callback);
  }

  /**
   * Removes associated memberships, tasks, and affinities on group destruction.
   * @override
   * @param selector
   * @param callback
   * @returns {any}
   */
  remove(selector, callback) {
    // destroy all memberships
    this.find(selector).forEach((group) => {
      const memberIds = _.map(group.members, member => member._id);
      Meteor.users.update({
        _id: { $in: memberIds }
      }, {
        $pull: {
          groups: {
            groupId: group._id
          }
        }
      }, {
        multi: true
      });

      Tasks.remove({ groupId: group._id });
      Affinities.remove({ groupId: group._id });
    });


    return super.remove(selector, callback);
  }
}

/**
 * @summary Collection containing all user groups.
 * @exports
 * @type {GroupCollection}
 */
export const Groups = new GroupCollection('groups');

/**
 * @summary Helper schema for any query for users in a group.
 * @type {SimpleSchema}
 */
Schema.GroupUserQuery = new SimpleSchema({
  groupId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  }
});

/**
 * @summary Schema for user roles in a group.
 * @type {SimpleSchema}
 */
Schema.GroupRole = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
    autoValue() {
      if (!this.isSet && this.operator != '$pull') {
        return Random.id();
      }
    }
  },
  title: {
    type: String,
    label: 'Role title',
    optional: true
  }
});

// TODO: should move this elsewhere
SimpleSchema.messages({
  either: '[label] or its partner field must be included'
});

/**
 * Validation method for SimpleSchema for requiring at least one of two keys.
 * @param context - Schema context (`this` value)
 * @param {string} partner - partner key to validate
 * @returns {string} - 'either', indicating the SimpleSchema error message to trigger
 * @constructor
 * @see Schema.Member for example
 */
Schema.ValidateEither = (context, partner) => {
  let tokens = context.key.split('.');
  tokens[tokens.length - 1] = partner;
  const field = tokens.join('.');
  if (!context.field(field).isSet && !context.value) {
    return 'either';
  }
};

/**
 * Schema for membership object in group. Replicated in users collection.
 * @type {SimpleSchema}
 */
Schema.Member = new SimpleSchema({
  fullName: {
    type: String,
    label: 'Member full name'
  },
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
    custom() {
      return Schema.ValidateEither(this, 'email');
    }
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true,
    custom() {
      return Schema.ValidateEither(this, 'userId');
    }
  },
  role: {
    type: Schema.GroupRole
  },
  isAdmin: {
    type: Boolean
  },
  isPending: {
    type: Boolean
  }
});

/**
 * Default roleset for groups on creation. Geared toward academic environment deployment.
 * @const
 * @type {{Professor: string, PostDoc: string, Graduate: string, Undergraduate: string}}
 */
export const DefaultRoles = {
  Professor: 'Professor',
  PostDoc: 'Post Doc',
  Graduate: 'Graduate Student',
  Undergraduate: 'Undergraduate Student'
};

/**
 * @summary Schema for group.
 * @type {SimpleSchema}
 */
Schema.Group = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
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
  creatorName: {
    type: String
  },
  creationDate: {
    type: Date
  },
  activePairing: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  roles: {
    type: Array,
    optional: true,
    autoValue() {
      if (this.isSet && Match.test(this.value, [String])) {
        return _.map(this.value, roleTitle => {
          return { title: roleTitle, _id: Random.id() }
        });
      } else if (!this.isUpdate) {
        return _.map(_.values(DefaultRoles), title => {
          return { title, _id: Random.id() }
        });
      }
    }
  },
  'roles.$': {
    type: Schema.GroupRole
  },
  members: {
    type: Array,
    optional: true,
    defaultValue: []
  },
  'members.$': {
    type: Schema.Member
  },
  publicJoin: {
    type: Boolean
  },
  allowGuests: {
    type: Boolean
  }
});

Groups.attachSchema(Schema.Group);

Groups.helpers({
  /**
   * Gets membership info from a userId.
   * @param {string} userId
   * @returns {?Object}
   */
  getMembership(userId) {
    return _.find(this.members, member => member.userId == userId);
  },
  /**
   * Gets user role title from userId.
   * @param {string} userId
   * @returns {?string}
   */
  getUserRole(userId) {
    const membership = this.getMembership(userId);
    return membership && membership.role.title;
  },
  /**
   * Gets user's index in group membership array.
   * @param {string} userId
   * @returns {number}
   */
  getMembershipIndex(userId) {
    return _.findIndex(this.members, member => member.userId == userId);
  },
  /**
   * Gets role info from title.
   * @param {string} title
   * @returns {?Object}
   */
  getRoleInfo(title) {
    return _.find(this.roles, role => role.title == title);
  },
  /**
   * Determines if user is member of group.
   * @param {string} userId
   * @returns {boolean}
   */
  containsMember(userId) {
    return _.some(this.members, { userId: userId });
  },
  /**
   * Determines if role is allowed in group.
   * @param {string} roleTitle
   * @returns {boolean}
   */
  containsRole(roleTitle) {
    return _.some(this.roles, { title: roleTitle });
  },
  /**
   * Determines if user is admin of group.
   * @param {string} userId
   * @returns {boolean}
   */
  isAdmin(userId) {
    const member = this.getMembership(userId);
    return member.isAdmin;
  },
  /**
   * Determines if user is a pending member in the group.
   * @param {string} userId
   * @returns {boolean}
   */
  isPending(userId) {
    const member = this.getMembership(userId);
    return member.isPending;
  },
  /**
   * Returns the admins in the group.
   * @returns {Array}
   */
  admins() {
    return _.filter(this.members, member => member.isAdmin);
  }
});

/**
 * @summary Helper class for bundling changes made to group memberships.
 * @class
 * @export
 * @example
 * // setting users A, B, and C to be admins
 * const group = Groups.findOne(groupId);
 * const users = [ userA, userB, userC]
 * const operations = new GroupOperationHelper(group) // user argument is optional
 * users.forEach(user => {
 *   operations.setUser(user);
 *   operations.setAdmin(true);
 *   operations.pushMember();
 * });
 * operations.pushGroup();
 */
export class GroupOperationHelper {
  constructor(group, user) {
    check(group, Schema.Group);
    this.group = group;
    if (user) {
      this.setUser(user);
    }
  }
  setUser(user) {
    check(user, Schema.User);
    this.user = user;
    this.groupMembershipIndex = this.group.getMembershipIndex(this.user._id);
    this.userMembershipIndex = this.user.getMembershipIndex(this.group._id);

    if (this.groupMembershipIndex === -1 || this.userMembershipIndex === -1) {
      throw new Meteor.Error('invalid-user', 'The user isn\'t in the specified group.');
    }
  }
  setAdmin(isAdmin) {
    this.group.members[this.groupMembershipIndex].isAdmin = isAdmin;
    this.user.groups[this.userMembershipIndex].isAdmin = isAdmin;
  }
  setPending(isPending) {
    this.group.members[this.groupMembershipIndex].isPending = isPending;
    this.user.groups[this.userMembershipIndex].isPending = isPending;
  }
  setRole(roleTitle) {
    const role = this.group.getRoleInfo(roleTitle);
    if (!role) {
      throw new Meteor.Error('invalid-role', 'This role isn\'t allowed for this group.');
    }
    this.group.members[this.groupMembershipIndex].role = role;
    this.user.groups[this.userMembershipIndex].role = role;
  }
  pushAll() {
    this.pushMember();
    this.pushGroup();
  }
  pushMember() {
    Meteor.users.update(this.user._id, { $set: { groups: this.user.groups } });
  }
  pushGroup() {
    Groups.update(this.group._id, { $set: { members: this.group.members } });
  }
}
