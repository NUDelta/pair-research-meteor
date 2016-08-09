import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'lodash';

import { Schema } from '../schema.js';
import { generateAvatar } from '../util.js';

/**
 * @summary Placeholder id for groups created as a demo.
 * @exports
 * @const
 * @type {string}
 * @todo Replace with site admin userId?
 */
export const DEMO_GROUP_CREATOR = '33333333333333333';

/**
 * @summary Schema for a user's membership in a group. Replicated in groups collection.
 * @type {SimpleSchema}
 */
Schema.UserGroupMembership = new SimpleSchema({
  groupId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  groupName: {
    type: String
  },
  role: {
    type: Schema.GroupRole // should be id?
  },
  isAdmin: {
    type: Boolean
  },
  isPending: {
    type: Boolean
  }
});

/**
 * @summary Schema for publicly exposed user profile.
 * @type {SimpleSchema}
 */
Schema.UserProfile = new SimpleSchema({
  fullName: {
    type: String
  },
  screenName: {
    type: String,
    optional: true
  },
  avatar: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  }
});

/**
 * @summary Schema for the whole user profile.
 * @type {SimpleSchema}
 */
Schema.User = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  username: {
    type: String,
    optional: true
  },
  emails: {
    type: Array
  },
  'emails.$': {
    type: Object
  },
  'emails.$.address': {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  'emails.$.verified': {
    type: Boolean
  },
  createdAt: {
    type: Date
  },
  groups: {
    type: Array
  },
  'groups.$': {
    type: Schema.UserGroupMembership,
  },
  profile: {
    type: Schema.UserProfile
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  heartbeat: {
    type: Date,
    optional: true
  }
});

/**
 * @summary Schema for a simplified user profile, to be used in the demo pairing group.
 * @type {SimpleSchema}
 */
Schema.SimpleUser = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  name: {
    type: String
  }
});

Meteor.users.attachSchema(Schema.User);

Meteor.users.deny({
  update() { return true; }
});

/**
 * @summary Returns an array of the groupIds a user is in.
 * @param {string} userId
 * @returns {Array}
 */
Meteor.users.findUserGroups = (userId) => {
  const user = Meteor.users.findOne(userId);
  return _.map(user.groups, group => group.groupId);
};

Meteor.users.helpers({
  /**
   * @summary Retrieves a user's email.
   * @return {?string}
   * @todo Should process the case of multiple emails (e.g. being invited when they already have
   *       an account under a different email).
   */
  email() {
    return this.emails.length > 0 && this.emails[0].address
  },
  /**
   * @summary Retrieves a user's avatar url or generates a dataURI from their initials if they don't
   *          have one set.
   * @returns {string}
   */
  avatar() {
    if (this.profile.avatar) {
      return this.profile.avatar
    } else {
      return generateAvatar(this.profile.fullName);
    }
  },
  /**
   * @summary Gets a group's index in the group membership array.
   * @param {string} groupId
   * @returns {number}
   */
  getMembershipIndex(groupId) {
    return _.findIndex(this.groups, group => group.groupId == groupId);
  },
  /**
   * @summary Determines if user has set a password.
   * @locus server
   * @returns {boolean}
   * @todo Unclear if this is the best way to check.
   */
  isActive() {
    return !!this.services.password.bcrypt;
  }
});
