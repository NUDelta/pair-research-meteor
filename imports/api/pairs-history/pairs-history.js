import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/stevezhu:lodash';

import { Schema } from '../schema.js';

// For now, expecting this collection to be purely for analytic purposes.

class PairsHistoryCollection extends Mongo.Collection {
  // @client only
  topPartners(userId) {
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
    return _.frequencyPairs(partners);
  }
  // @client only (include groupId for computation on server?)
  topRolePartners(userId) {
    const pairs = this.find({
      $or: [
        { firstUserId: userId }, { secondUserId: userId }
      ]
    }, { reactive: false }).fetch();

    const partnerRoles = _.compact(_.map(pairs, pair => {
      if (pair.firstUserId == userId) {
        return pair.secondUserRole;
      } else {
        return pair.firstUserRole;
      }
    }));

    return _.frequencyPairs(partnerRoles);
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
  firstUserRole: {
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
  secondUserRole: {
    type: String,
    optional: true
  },
  timestamp: {
    type: Date
  }
});

PairsHistory.attachSchema(Schema.PairHistory);
