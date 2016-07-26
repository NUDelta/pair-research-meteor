import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/stevezhu:lodash';

import { Schema } from '../schema.js';

// For now, expecting this collection to be purely for analytic purposes.

class PairsHistoryCollection extends Mongo.Collection {

  //noinspection JSMethodCanBeStatic
  constructQuery(type, info) {
    if (type == 'individual' && info) {
      return {
        $or: [
          { firstUserId: info}, { secondUserId: info}
        ]
      };
    } else if (type == 'role' && info) {
      return {
        $or: [
          { firstUserRole: info}, { secondUserRole: info}
        ]
      };
    } else if (type == 'all') {
      return { secondUserId: { $exists: true } };
    }
  }

  constructMap(type, info, field) {
    let compare = '';
    if (type == 'individual') {
      compare = 'firstUserId';
    } else if (type == 'role') {
      compare = 'firstUserRole';
    }

    return pair => {
      if (pair[compare] == info) {
        if (field == 'individual') {
          return pair.secondUserName;
        } else if (field == 'role') {
          return pair.secondUserRole;
        }
      } else {
        if (field == 'individual') {
          return pair.firstUserName;
        } else if (field == 'role') {
          return pair.firstUserRole;
        }
      }
    };
  }

  /**
   * Returns frequency pairs of the top partners of a given individual or role
   * @client-only
   *
   * @param type 'individual' or 'role', describes the source of comparison
   * @param info Value to match on
   * @param field 'individual' or 'role', describes the desired output
   * @returns {Array}
   */
  topPartners(type, info, field) {
    const pairs = this.find(this.constructQuery(type, info), { reactive: false }).fetch();
    const partners = _.compact(_.map(pairs, this.constructMap(type, info, field)));
    return _.frequencyPairs(partners);
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
