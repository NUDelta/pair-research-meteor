import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Schema } from '../schema.js';

class GroupCollection extends Mongo.Collection {
  insert(group, callback) {
    let groupId = super.insert(group, callback);
    Meteor.users.update(group.creatorId, { $push: { groups: groupId }});
    return groupId;
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

// TODO: Redo Group membership, since clearly anyone can add themselves to a group?
Schema.Group = new SimpleSchema({
  groupName: {
    type: String
  },
  creatorId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  activePairing: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  }
  // creation date
  // public private
});

Groups.attachSchema(Schema.Group);

Groups.allow({
  insert(userId, doc) {
    return doc.creatorId == userId;
  }
});

// TODO: add schemas that are commonly used in methods
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
