import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Schema } from '../schema.js';

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
    type: Schema.GroupRole
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
    return this.emails.length > 0 && this.emails[0].address
  }
});
