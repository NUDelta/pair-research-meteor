import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'lodash';

import { DEMO_GROUP_CREATOR } from './users/users.js';
import { Groups } from './groups/groups.js';

/**
 * Type definitions for different authentication permissions
 *  - GroupAdmin: admin of group
 *  - GroupMember: is member of group
 *  - GroupSelf: is editing own membership in group
 *  - LoggedIn: user is logged in
 * @type {{GroupAdmin: string, GroupMember: string, GroupSelf: string, LoggedIn: string}}
 * @readonly
 * @enum {string}
 */
export const Auth = {
  GroupAdmin: 'GroupAdmin',
  GroupMember: 'GroupMember',
  GroupSelf: 'GroupSelf',
  LoggedIn: 'LoggedIn',
  Any: 'Any'
};

/**
 * ValidatedMethod mixin for authenticating user permissions for actions in groups.
 * @constructor
 * @mixin
 * @param {Object} methodOptions
 * @returns {*}
 */
export const AuthMixin = (methodOptions) => {
  check(methodOptions.allow, Array);

  const runFunc = methodOptions.run;
  methodOptions.run = function() {
    // TODO: not sure if this argument extraction is best practice
    const args = arguments[0];
    const groupId = args.groupId;
    const userId = args.userId;

    if (this.isTrusted || isAuthorized(this.userId, userId, groupId, methodOptions.allow)) {
      return runFunc.apply(this, arguments);
    } else {
      // throw new AuthError(methodOptions.allow);
      throw new Meteor.Error('You don\'t have the appropriate permissions to make this request.');
    }
  };
  methodOptions.runTrusted = function() {
    return runFunc.apply({ isTrusted: true }, arguments);
  };
  return methodOptions;
};

/**
 * Checks permissions based on authentication level
 * @param {string} activeUserId - Passed in as this.userId.
 * @param {string} editUserId - The user being edited.
 * @param {string} groupId - The group being edited.
 * @param {Array} allowed - The allowed authentication levels.
 * @returns {boolean}
 */
function isAuthorized(activeUserId, editUserId, groupId, allowed) {
  const group = Groups.findOne(groupId);
  if (group && group.creatorId === DEMO_GROUP_CREATOR) {
    return true;
  } else {
    return _.some(allowed, role => {
      switch(role) {
        case Auth.GroupAdmin:
          return activeUserId && group && group.isAdmin(activeUserId);
        case Auth.GroupMember:
          return activeUserId && group && group.containsMember(activeUserId);
        case Auth.GroupSelf:
          return activeUserId && group && group.containsMember(activeUserId) && activeUserId == editUserId;
        case Auth.LoggedIn:
          return !!activeUserId;
        default:
          return true;
      }
    });
  }
}

/**
 * Public authentication function to be called at the beginning of publications.
 * @param {Auth} allowed - The allowed authentication level(s).
 * @param {string} userId - The current userId (`this.userId`).
 * @param {string} groupId - The active group.
 * @param {string} editUserId - The user document being edited.
 */
export function authenticated(allowed, userId, groupId = '', editUserId = '') {
  let allowedRoles = allowed;
  if (typeof allowed !== Array) {
    allowedRoles = [allowed];
  }
  return isAuthorized(userId, editUserId, groupId, allowedRoles);
};

/**
 * Verifies the existence of a groupId, returning the group object if found.
 * @param {string} groupId
 * @returns {any}
 */
export function verifyGroup(groupId) {
  const group = Groups.findOne(groupId);
  if (!group) {
    throw new Meteor.Error('invalid-group', 'The specified group does not exist.');
  }
  return group;
};

/**
 * Verifies the existence of a userId, returning the user object if found.
 * @param {string} userId
 * @returns {any}
 */
export function verifyUser(userId) {
  const user = Meteor.users.findOne(userId);
  if (!user) {
    throw new Meteor.Error('invalid-user', 'The specified user does not exist.');
  }
  return user;
};

/**
 * Custom authentication error + messages
 * @todo
 */
class AuthError extends Meteor.Error {
  constructor(role) {
    const authError = AuthErrors[role];
    super(authError.error, authError.reason, authError.details);
  }
}

const AuthErrors = {
  GroupAdmin: {
    error: '',
    reason: '',
    details: ''
  }
};
