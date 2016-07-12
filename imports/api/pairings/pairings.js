import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Groups } from '../groups/groups.js';
import { Pairs } from '../pairs/pairs.js';
import { Schema } from '../schema.js';

class PairingCollection extends Mongo.Collection {
  insert(pairing, callback) {
    pairing.timestamp = new Date();
    const _id = super.insert(pairing, callback);
    pairing.pairings.forEach((pair) => {
      Pairs.insert({
        groupId: pairing.groupId,
        pairingId: _id,
        firstUserId: pair.firstUserId,
        firstUserName: pair.firstUserName,
        secondUserId: pair.secondUserId,
        secondUserName: pair.secondUserName
      });
    });
    Groups.update(pairing.groupId, { $set: { activePairing: _id }});
    return _id;
  }
}

export const Pairings = new PairingCollection('pairings');

Schema.SinglePairing = new SimpleSchema({
  firstUserId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  firstUserName: {
    type: String
  },
  secondUserId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  secondUserName: {
    type: String,
    optional: true
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
  timestamp: {
    type: Date
  }
});

Pairings.attachSchema(Schema.Pairing);

Pairings.helpers({
  partner(userId) {
    const pairing = _.find(this.pairings, (pairing) => {
      return pairing.firstUserId == userId || pairing.secondUserId == userId;
    });
    if (pairing.firstUserId == userId) {
      return { userId: pairing.secondUserId, name: pairing.secondUserName };
    } else {
      return { userId: pairing.firstUserId, name: pairing.firstUserName };
    }
  }
});