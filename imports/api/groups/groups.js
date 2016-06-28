import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Roles } from '../users/users.js';
import { Schema } from '../schema.js';

class GroupCollection extends Mongo.Collection {
  insert(group, callback) {
    return super.insert(group, callback);
  }

  update(selector, callback) {
    return super.update(selector, callback);
  }

  remove(selector, callback) {
    // destroy all memberships
    return super.remove(selector, callback);
  }
}

export const Groups = new GroupCollection('groups');

Schema.GroupRole = new SimpleSchema({
  title: {
    type: String
  },
  weight: {
    type: Number
  }
});

export const DefaultRoles = [
  {
    title: 'Admin',
    weight: Roles.Admin
  },
  {
    title: 'Member',
    weight: Roles.Member
  },
  {
    title: 'Pending',
    weight: Roles.Pending
  }
];

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
  // TODO: implement user roles
  roles: {
    type: Array,
    optional: true,
    defaultValue: DefaultRoles
  },
  'roles.$': {
    type: Schema.GroupRole
  },
  publicJoin: {
    type: Boolean
  },
  allowGuests: {
    type: Boolean
  }
});

Groups.attachSchema(Schema.Group);

Groups.allow({
  insert(userId, doc) {
    return doc.creatorId == userId;
  }
});

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
