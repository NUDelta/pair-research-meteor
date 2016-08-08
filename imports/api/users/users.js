import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/stevezhu:lodash';

import { Schema } from '../schema.js';
import { generateAvatar } from '../util.js';

// TODO: replace with privately loaded admin id?
export const DEMO_GROUP_CREATOR = '33333333333333333';

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

Meteor.users.findUserGroups = (userId) => {
  const user = Meteor.users.findOne(userId);
  return _.map(user.groups, group => group.groupId);
};

Meteor.users.helpers({
  email() {
    // TODO: I don't expect this to turn out troublesome ever, but should keep in mind
    // if people ever have multiple emails (e.g. from being invited when they already
    // have an account under a different email
    return this.emails.length > 0 && this.emails[0].address
  },
  avatar() {
    if (this.profile.avatar) {
      return this.profile.avatar
    } else {
      return generateAvatar(this.profile.fullName);
    }
  },
  getMembershipIndex(groupId) {
    return _.findIndex(this.groups, group => group.groupId == groupId);
  },
  isActive() {
    // TODO: in future, this should check for VERIFIED emails
    return !!this.services.password.bcrypt;
  }
});
