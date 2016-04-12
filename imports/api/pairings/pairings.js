import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Schema } from '../schema.js';

class PairingCollection extends Mongo.Collection {
  insert(pairing, callback) {
    return super.insert(pairing, callback)
  }
}

export const Pairings = new PairingCollection('pairings');

Schema.SinglePairing = new SimpleSchema({
  firstUserId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  secondUserId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  }
});

Schema.Pairing = new SimpleSchema({
  groupId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  pairings: {
    type: Array
  },
  'pairings.$': {
    type: Schema.SinglePairing
  },
  active: {
    type: Boolean
  }
});