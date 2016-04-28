import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Schema } from '../schema.js';

class AffinityCollection extends Mongo.Collection {
  insert(affinity, callback) {
    return super.insert(affinity, callback);
  }
}

export const Affinities = new AffinityCollection('affinities');

Schema.Affinity = new SimpleSchema({
  helperId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  helpeeId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  groupId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  value: {
    type: Number,
    min: -1,
    max: 1,
    decimal: true
  }
});

Affinities.attachSchema(Schema.Affinity);
