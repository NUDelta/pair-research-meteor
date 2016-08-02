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

    if (this.isTrusted || authenticate(this.userId, userId, groupId, methodOptions.allow)) {
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

function authenticate(activeUserId, editUserId, groupId, allowed) {
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
