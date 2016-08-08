import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/stevezhu:lodash';

import { Schema } from '../schema.js';

/**
 * @summary Constructor for the stored history of pairings.
 * @class
 */
class PairsHistoryCollection extends Mongo.Collection {

  /**
   * Constructs queries based on individual, role, or all.
   * @param {string} type - either 'individual', 'role', or 'all', depending on set wanted.
   * @param {string} info - specifier for the selected type (e.g. userId for 'individual')
   * @returns {Object}
   * @todo Prob should make param type an enum.
   */
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

  /**
   * Constructs a mapping function that retrieves the relevant fields from a pairing document,
   * based on the type specified.
   * @private
   * @param {string} type - 'individual' or 'role', for the source of comparison
   * @param {string} info - specifier for the selected type
   * @param {string} field - 'individual' or 'role', for the desired output
   * @returns {function(string)}
   */
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
   * @locus client
   * @param {string} type - 'individual' or 'role', describes the source of comparison
   * @param {string} info - specifier for the selected type
   * @param {string} field - 'individual' or 'role', describes the desired output
   * @returns {Array}
   */
  topPartners(type, info, field) {
    const pairs = this.find(this.constructQuery(type, info), { reactive: false }).fetch();
    const partners = _.compact(_.map(pairs, this.constructMap(type, info, field)));
    return _.frequencyPairs(partners);
  }
}

/**
 * @summary Collection holding archive of pairing history.
 * @exports
 * @analytics
 * @see Pairings
 * @type {PairsHistoryCollection}
 */
export const PairsHistory = new PairsHistoryCollection('pairs_history');

/**
 * @summary Schema for an archived pairing history document.
 * @type {SimpleSchema}
 */
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
