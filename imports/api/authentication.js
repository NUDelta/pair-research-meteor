import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'meteor/stevezhu:lodash';

import { Groups } from './groups/groups.js';

/**
 * Type definitions for different authentication permissions
 *  - GroupAdmin: admin of group
 *  - GroupMember: is member of group
 *  - GroupSelf: is editing own membership in group
 *  - LoggedIn: user is logged in
 * @type {{GroupAdmin: string, GroupMember: string, GroupSelf: string, LoggedIn: string}}
 */
export const Auth = {
  GroupAdmin: 'GroupAdmin',
  GroupMember: 'GroupMember',
  GroupSelf: 'GroupSelf',
  LoggedIn: 'LoggedIn'
};

export const AuthMixin = (methodOptions) => {
  check(methodOptions.allow, Array);

  const runFunc = methodOptions.run;
  methodOptions.run = function() {
    const args = arguments[0];
    const groupId = args.groupId;
    const userId = args.userId;

    if (this.isTrusted || isAuthorized(this.userId, userId, groupId, methodOptions.allow)) {
      return runFunc.apply(this, arguments); // TODO: extract groupId from arguments?
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

function isAuthorized(activeUserId, editUserId, groupId, allowed) {
  const group = Groups.findOne(groupId);
  return _.some(allowed, role => {
    switch(role) {
      case Auth.GroupAdmin:
        return activeUserId && group.isAdmin(activeUserId);
      case Auth.GroupMember:
        return activeUserId && group.containsMember(activeUserId);
      case Auth.GroupSelf:
        return activeUserId && group.containsMember(activeUserId) && activeUserId == editUserId;
      case Auth.LoggedIn:
        return !!activeUserId;
      default:
        return true;
    }
  });
}

export function authenticate(allowed, userId, groupId, editUserId) {
  if (!isAuthorized(userId, editUserId, groupId, allowed)) {
    // throw new AuthError(methodOptions.allow);
    throw new Meteor.Error('You don\'t have the appropriate permissions to make this request.');
  }
};

export function verifyGroup(groupId) {
  const group = Groups.findOne(groupId);
  if (!group) {
    throw new Meteor.Error('invalid-group', 'The specified group does not exist.');
  }
  return group;
};

export function verifyUser(userId) {
  const user = Meteor.users.findOne(userId);
  if (!user) {
    throw new Meteor.Error('invalid-user', 'The specified user does not exist.');
  }
  return user;
};

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
