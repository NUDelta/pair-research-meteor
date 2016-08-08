import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Schema } from '../schema.js';

/**
 * @summary Constructor for the stored history of affinities.
 * @placeholder
 * @class
 */
class AffinitiesHistoryCollection extends Mongo.Collection {
  insert(affinity, callback) {
    return super.insert(affinity, callback);
  }
}

/**
 * @summmary Collection holding history of users' ratings how much they can help each other.
 * @exports
 * @analytics
 * @see Affinities
 * @type {AffinitiesHistoryCollection}
 */
export const AffinitiesHistory = new AffinitiesHistoryCollection('affinities_history');

/**
 * @summary Schema for each archived affinity.
 * @type {SimpleSchema}
 */
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
