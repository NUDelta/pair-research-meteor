import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'lodash';

import { DEMO_GROUP_CREATOR } from '../users/users.js';
import { Affinities } from '../affinities/affinities.js';
import { AffinitiesHistory } from '../affinities-history/affinities-history.js';
import { Groups } from '../groups/groups.js';
import { PairsHistory } from '../pairs-history/pairs-history.js';
import { Tasks } from '../tasks/tasks.js';
import { TasksHistory } from '../tasks-history/tasks-history.js';

import { Schema } from '../schema.js';

/**
 * @summary Constructor for the Pairing collection.
 * @class
 */
class PairingCollection extends Mongo.Collection {
  /**
   * Attaches timestamp if missing, updates group's current pairing, and archives pairing info.
   * @override
   * @param {Object} pairing
   * @param {function(string)} callback
   * @returns {any}
   * @todo Figure out a better solution on where to attach timestamp. People shouldn't be able to
   *       specifiy a custom one.
   */
  insert(pairing, callback) {
    if (!pairing.timestamp) {
      pairing.timestamp = new Date();
    }
    const _id = super.insert(pairing, callback);
    
    Groups.update(pairing.groupId, { $set: { activePairing: _id }});
    this.saveHistory(_id, pairing);
    return _id;
  }

  /**
   * @summary Archives pairing info history.
   * @param {string} id
   * @param {Object} pairing
   */
  saveHistory(id, pairing) {
    const group = Groups.findOne(pairing.groupId);
    if (group.creatorId == DEMO_GROUP_CREATOR) {
      return;
    }

    pairing.pairings.forEach((pair) => {
      PairsHistory.insert({
        groupId: pairing.groupId,
        pairingId: id,
        firstUserId: pair.firstUserId,
        firstUserName: pair.firstUserName,
        firstUserRole: group.getUserRole(pair.firstUserId),
        secondUserId: pair.secondUserId,
        secondUserName: pair.secondUserName,
        secondUserRole: group.getUserRole(pair.secondUserId),
        timestamp: pairing.timestamp
      });
    });

    const userIds = _.compact(_.concat(
      _.map(pairing.pairings, pair => pair.firstUserId),
      _.map(pairing.pairings, pair => pair.secondUserId)
    ));

    Affinities.find({
      groupId: pairing.groupId,
      helperId: { $in: userIds },
      helpeeId: { $in: userIds }
    }).forEach((affinity) => {
      affinity.pairingId = id;
      delete affinity._id;
      AffinitiesHistory.insert(affinity);
    });

    Tasks.find({
      groupId: pairing.groupId,
      userId: { $in: userIds }
    }).forEach((task) => {
      task.pairingId = id;
      delete task._id;
      TasksHistory.insert(task);
    });
  }
}

/**
 * @summary Collection containing all pairing history.
 * @exports
 * @type {PairingCollection}
 * @todo Refactor? Redundant with PairsHistory right now, oddly enough.
 */
export const Pairings = new PairingCollection('pairings');

/**
 * @summary Schema for a single pairing.
 * @type {SimpleSchema}
 */
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

/**
 * @summary Schema for a pairing history document.
 * @type {SimpleSchema}
 */
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
  /**
   * @summary Retrieves a users partner in a pairing.
   * @param userId
   * @returns {Object}
   */
  partner(userId) {
    const pairing = _.find(this.pairings, (pairing) => {
      return pairing.firstUserId == userId || pairing.secondUserId == userId;
    });
    if (pairing) {
      if (pairing.firstUserId == userId) {
        return { userId: pairing.secondUserId, name: pairing.secondUserName };
      } else {
        return { userId: pairing.firstUserId, name: pairing.firstUserName };
      }
    }
  }
});