import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/stevezhu:lodash';

import { Schema } from '../schema.js';

// For now, expecting this collection to be purely for analytic purposes.

class PairsHistoryCollection extends Mongo.Collection {
  topPartners(userId) {
    // TODO: determine if reactive (make not)
    const pairs = this.find({
      $or: [
        { firstUserId: userId }, { secondUserId: userId }
      ]
    }, { reactive: false }).fetch();
    const partners = _.compact(_.map(pairs, pair => {
      if (pair.firstUserId == userId) {
        return pair.secondUserName;
      } else {
        return pair.firstUserName;
      }
    }));
    return _.sortBy(_.toPairs(_.countBy(partners)), pair => -pair[1]);
  }
}

export const PairsHistory = new PairsHistoryCollection('pairs_history');

Schema.PairHistory = new SimpleSchema({
  groupId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  pairingId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
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
  },
  timestamp: {
    type: Date
  }
});

PairsHistory.attachSchema(Schema.PairHistory);
