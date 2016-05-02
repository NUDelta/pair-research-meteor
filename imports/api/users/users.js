import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Schema } from '../schema.js';

export const Roles = {
  Admin: 100,
  Member: 10,
  Pending: 1
};

Schema.UserGroupMembership = new SimpleSchema({
  groupId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  role: {
    type: Number,
    allowedValues: [ Roles.Admin, Roles.Member, Roles.Pending ]
  }
});

Schema.UserProfile = new SimpleSchema({
  // placeholder, doesn't do anything yet
  picture: {
    type: String,
    optional: true
  }
});

Schema.User = new SimpleSchema({
  username: {
    type: String,
    optional: true
  },
  emails: {
    type: Array,
    optional: true
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
    regEx: SimpleSchema.RegEx.Id
  },
  profile: {
    type: Schema.UserProfile,
    optional: true
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

Meteor.users.attachSchema(Schema.User);

Meteor.users.findUserGroups = (userId) => {
  const user = Meteor.users.findOne(userId);
  return _.map(user.groups, group => group.groupId);
};
