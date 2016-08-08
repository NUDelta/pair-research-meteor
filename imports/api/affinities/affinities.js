import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Schema } from '../schema.js';

/**
 * @summary Constructor for the Affinities collection.
 * @placeholder
 * @class
 */
class AffinityCollection extends Mongo.Collection {
  insert(affinity, callback) {
    return super.insert(affinity, callback);
  }
}

/**
 * @summary Collection holding current users' ratings of how much they can help each other.
 * @exports
 * @type {AffinityCollection}
 */
export const Affinities = new AffinityCollection('affinities');

/**
 * @summary Schema for each affinity.
 * @type {SimpleSchema}
 */
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
