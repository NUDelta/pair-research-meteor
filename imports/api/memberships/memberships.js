import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Schema } from '../schema.js';

class MembershipCollection extends Mongo.Collection {
  insert(membership, callback) {
    // join timestamp etc.
    return super.insert(membership, callback);
  }
}

export const Memberships = new MembershipCollection('memberships');

Schema.Membership = new SimpleSchema({
  member: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  group: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  }
  // join date?
  // role?
});

Memberships.attachSchema(Schema.Membership);
