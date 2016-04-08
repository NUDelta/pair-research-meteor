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
  helper: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  helpee: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  group: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  value: {
    type: Number
  }
});

Affinities.attachSchema(Schema.Affinity);
