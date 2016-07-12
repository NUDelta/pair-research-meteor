import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Schema } from '../schema.js';

// For now, expecting this collection to be purely for analytic purposes.
class AffinitiesHistoryCollection extends Mongo.Collection {
  insert(affinity, callback) {
    return super.insert(affinity, callback);
  }
}

export const AffinitiesHistory = new AffinitiesHistoryCollection('affinities_history');

Schema.AffinityHistory = new SimpleSchema({
  pairingId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
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

AffinitiesHistory.attachSchema(Schema.AffinityHistory);
