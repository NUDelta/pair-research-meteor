import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Schema } from '../schema';
import { Memberships } from '../memberships/memberships';

class GroupCollection extends Mongo.Collection {
  insert(group, callback) {
    console.log(this.userId);
    // add userId to membership
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

Schema.Group = new SimpleSchema({
  groupName: {
    type: String
  },
  creator: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  }
  // creation date
  // public private
});
