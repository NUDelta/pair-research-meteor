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
    const users = Tasks.find({ groupId: groupId, task: { $exists: true} }) .fetch()
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

    let edges = [];
    _.forEach(userPool, (userId, i) => {
      _.forEach(_.slice(userPool, i + 1), (_userId, j) => {
        if (scores[userId][_userId] !== -1 && scores[_userId][userId] !== -1) {
          edges.push([
            i, j + i + 1,
            Math.floor(Math.random() * 20 + // random pertubation
                1 + 99 * (scores[userId][_userId] + scores[_userId][userId]) / 2)
          ]);

          // TODO: penalty code
          // // add a bonus for each week that people haven't been recently pair. (The intention is to penalize recent pairs, but we pose it
          // // as a bonus instead because the weights on the graph have to be positive.)  Bonus exponentially decays.
          // previouslyPairedInWeek = pool.people[i].partners[pool.people[j].email];
          // if (!previouslyPairedInWeek) previouslyPairedInWeek = []; // so that we can still iterate through the loop below
          // for (var k = 1; k <= 3; ++k) { // go back 1, 2, and 3 weeks
          //   if (!previouslyPairedInWeek[k]) { // if k is outside the range of the array, the value will be undefined, so this condition will match
          //     w += 80 * Math.pow(0.5, k); // +40 if not paired last week, up to +70 if not paired in any of the last three weeks
          //   }
          // }
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
      const pairings = _.compact(_.concat(
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
      return Pairings.insert({
        groupId: groupId,
        pairings: pairings
      });
    } else {
      return 1;
    }
  }
});
