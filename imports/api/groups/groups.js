import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Schema } from '../schema.js';

class GroupCollection extends Mongo.Collection {
  insert(group, callback) {
    let groupId = super.insert(group, callback);
    Meteor.users.update(group.creatorId, { $push: { 'profile.groups': groupId }});
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

Schema.Group = new SimpleSchema({
  groupName: {
    type: String
  },
  creatorId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  }
  // creation date
  // public private
});

Groups.attachSchema(Schema.Group);