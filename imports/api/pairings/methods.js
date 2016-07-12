import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/stevezhu:lodash';
import { exec } from 'child_process';

import { Pairings } from './pairings.js';
import { Affinities } from '../affinities/affinities.js';
import { Tasks } from '../tasks/tasks.js';
import { Groups } from '../groups/groups.js';
import { Schema } from '../schema.js';
import { log } from '../logs';

import { DEV_OPTIONS, PAIR_SCRIPT } from '../../startup/config.js';

export const PAIRING_IN_PROGRESS = '22222222222222222';

export const makePairings = new ValidatedMethod({
  name: 'pairing.makePairings',
  validate: new SimpleSchema({
    groupId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),
  run({ groupId }) {
    Groups.update(groupId, { $set: { activePairing: PAIRING_IN_PROGRESS }});

    if (Meteor.isDevelopment && !this.isSimulation) {
      log.debug(`Sleeping for ${ DEV_OPTIONS.LATENCY } ms...`);
      Meteor._sleepForMs(DEV_OPTIONS.LATENCY);
    }

    // Form n^2 pool data
    const users = Tasks.find({ groupId: groupId, task: { $exists: true} }).fetch()
      .map(task => [ task.userId, task.name ]);
    const userPool = _.map(users, user => user[0]);

    const scores = {};
    userPool.forEach((userId) => {
      scores[userId] = {};
      userPool.forEach((_userId) => {
        if (userId != _userId) {
          scores[userId][_userId] = 0;
        }
      });
    });

    Affinities.find({ groupId: groupId }).forEach((affinity) => {
      if (_.has(scores, affinity.helperId) &&
          _.has(scores[affinity.helperId], affinity.helpeeId)) {
        scores[affinity.helperId][affinity.helpeeId] = affinity.value;
      }
    });

    const recentPairings = Pairings.find({ groupId: groupId }, { sort: { timestamp: -1 }, limit: 3 }).fetch();

    let edges = [];
    _.forEach(userPool, (userId, i) => {
      _.forEach(_.slice(userPool, i + 1), (_userId, j) => {
        if (scores[userId][_userId] !== -1 && scores[_userId][userId] !== -1) {
          let weight = 1 + 99 *(scores[userId][_userId] + scores[_userId][userId]) / 2;

          // repeat penalty
          _.forEach(recentPairings, (pairing, index) => {
            if (pairing.partner(userId).userId != _userId) {
              weight += 80 * Math.pow(0.5, index + 1);
            }
          });

          // random pertubation
          weight += Math.random() * 20;

          edges.push([ i, j + i + 1, Math.floor(weight) ]);
        }
      });
    });

    if (!this.isSimulation) {
      log.info(`running Python script at ${ PAIR_SCRIPT }`);
      const data = JSON.stringify(edges);
      const cmd = `echo '${ data }' | python ${ PAIR_SCRIPT }`;
      const partners = JSON.parse(Meteor.wrapAsync(exec)(cmd));
      log.info(`script results: ${ JSON.stringify(partners) }`);

      // Avoiding duplicates
      const unpairedUsers = _.zipObject(_.range(users.length), _.map(users, user => true));
      let pairings = _.compact(_.concat(
          _.shuffle(
            _.map(partners, (partner, index) => {
              if (partner !== -1 && unpairedUsers[index] && unpairedUsers[partner]) {
                unpairedUsers[index] = false;
                unpairedUsers[partner] = false;
                const pair = _.shuffle([ users[index], users[partner] ]);
                return {
                  firstUserId: pair[0][0],
                  firstUserName: pair[0][1],
                  secondUserId: pair[1][0],
                  secondUserName: pair[1][1]
                };
              }
            })),
          _.shuffle(
            _.map(partners, (partner, index) => {
              if (partner === -1) {
                return {
                  firstUserId: users[index][0],
                  firstUserName: users[index][1]
                };
              }
          }))
        ));
      log.info(pairings);
      if (pairings.length === 0) {
        pairings = _.map(users, user => {
          return { firstUserId: user[0], firstUserName: user[1] };
        });
      }
      return Pairings.insert({
        groupId: groupId,
        pairings: pairings
      });
    } else {
      return 1;
    }
  }
});
