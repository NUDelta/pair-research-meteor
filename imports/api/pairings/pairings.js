import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/stevezhu:lodash';

import { Affinities } from '../affinities/affinities.js';
import { AffinitiesHistory } from '../affinities-history/affinities-history.js';
import { Groups } from '../groups/groups.js';
import { PairsHistory } from '../pairs-history/pairs-history.js';
import { Tasks } from '../tasks/tasks.js';
import { TasksHistory } from '../tasks-history/tasks-history.js';

import { Schema } from '../schema.js';
import { log } from '../logs.js';

class PairingCollection extends Mongo.Collection {
  insert(pairing, callback) {
    if (Meteor.isDevelopment && !pairing.timestamp) {
      pairing.timestamp = new Date();
    }
    const _id = super.insert(pairing, callback);
    
    Groups.update(pairing.groupId, { $set: { activePairing: _id }});
    this.saveHistory(_id, pairing);
    return _id;
  }
  
  saveHistory(id, pairing) {
    const group = Groups.findOne(pairing.groupId);

    pairing.pairings.forEach((pair) => {
      PairsHistory.insert({
        groupId: pairing.groupId,
        pairingId: id,
        firstUserId: pair.firstUserId,
        firstUserName: pair.firstUserName,
        firstUserRole: group.getRole(pair.firstUserId),
        secondUserId: pair.secondUserId,
        secondUserName: pair.secondUserName,
        secondUserRole: group.getRole(pair.secondUserId),
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