import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'lodash';
import { exec } from 'child_process';

import { Pairings } from './pairings.js';
import { Affinities } from '../affinities/affinities.js';
import { Tasks } from '../tasks/tasks.js';
import { Groups } from '../groups/groups.js';
import { log } from '../logs';

import { DEV_OPTIONS, PAIR_SCRIPT } from '../../startup/config.js';

/**
 * @summary Placeholder id for group pairings that indicates in progress so the page shows a spinner.
 * @const
 * @type {string}
 * @todo This might not be triggered properly in the horse race? (investigate! TODO)
 */
export const PAIRING_IN_PROGRESS = '22222222222222222';

/**
 * Pair Research pairing function. The powerhouse of the pair research application. Based on
 * HQ's Pair Research algorithm; calls the Python matching script after generating the appropriate
 * graph structure.
 * @isMethod true
 */
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

    // Simulating lag for the pairing in progress spinner.
    if (Meteor.isDevelopment && !this.isSimulation) {
      log.debug(`Sleeping for ${ DEV_OPTIONS.LATENCY } ms...`);
      Meteor._sleepForMs(DEV_OPTIONS.LATENCY);
    }

    // Form n^2 pool data
    const users = Tasks.find({ groupId: groupId, task: { $exists: true} }).fetch()
      .map(task => [ task.userId, task.name ]);
    const userPool = _.map(users, user => user[0]);

    // Initialize n-by-n 0s matrix without diagonal
    const scores = {};
    userPool.forEach((userId) => {
      scores[userId] = {};
      userPool.forEach((_userId) => {
        if (userId !== _userId) {
          scores[userId][_userId] = 0;
        }
      });
    });

    // Replace 0s with affinities (-1 to 1), if helper has rated helpee
    Affinities.find({ groupId: groupId }).forEach((affinity) => {
      if (_.has(scores, affinity.helperId) && _.has(scores[affinity.helperId], affinity.helpeeId)) {
        scores[affinity.helperId][affinity.helpeeId] = affinity.value;
      }
    });

    // Fetch last 3 pairings, ordered by most recent first
    const recentPairings = Pairings.find({ groupId: groupId }, { sort: { timestamp: -1 }, limit: 3 }).fetch();

    // Create undirected graph for maximum weighted matching
    let undirectedGraph = [];

    _.forEach(userPool, (userId, i) => {
      // Loop through upper triangular portion of matrix only (lower is redundant)
      _.forEach(_.slice(userPool, i + 1), (_userId, j) => {
        // Add edge iff at least one user in each pair has rated the other > -1 (rating of 1 in interface)
        if (scores[userId][_userId] !== -1 && scores[_userId][userId] !== -1) {
          // Initial weighting ranging from 1 - 100
          let weight = 1 + 99 * (scores[userId][_userId] + scores[_userId][userId]) / 2;
          weight = weight !== null ? weight : 0;

          // Penalize recent pairings by increasing weight of pairs that have NOT occurred recently for last 3 pairings
          // ex. If A and B have not paired last time, increase their weight by 80 * 0.5^1
          // ex. If they also didn't pair time before, further increase their weight by 80 * 0.5^2 and so on (up to 3)
          _.forEach(recentPairings, (pairing, index) => {
            const partner = pairing.partner(userId);
            if (partner && partner.userId !== _userId) {
              weight += 80 * Math.pow(0.5, index + 1);
            }
          });

          // Add a random perturbation, between 0-20, to prevent identical edge weights and handle unrated cases
          weight += Math.random() * 20;

          // Floor the final weight and add as an edge
          undirectedGraph.push([ i, j + i + 1, Math.floor(weight) ]);
        }
      });
    });

    // Create directed graph for stable matching
    let directedGraph = [];

    _.forEach(userPool, (userId, i) => {
      let currentRow = [];
      _.forEach(userPool, (_userId, j) => {
        // Ignore diagonal
        if (i === j) {
          currentRow.push(0);
          return undefined; // Continue in _.forEach
        }

        // Initial weighted ranging from -100 to 100
        let weight = 1 + 99 * scores[userId][_userId];
        weight = weight !== null ? weight : 0; // if no rating, give neutral rating of 0

        // Penalize recent pairings by increasing weight of pairs that have NOT occurred recently for last 3 pairings
        // Only give extra weight if rating is not -1
        // ex. If A and B have not paired last time, increase their weight by 80 * 0.5^1
        // ex. If they also didn't pair time before, further increase their weight by 80 * 0.5^2 and so on (up to 3)
        if (scores[userId][_userId] !== -1) {
          _.forEach(recentPairings, (pairing, index) => {
            const partner = pairing.partner(userId);
            if (partner && partner.userId !== _userId) {
              weight += 80 * Math.pow(0.5, index + 1);
            }
          });
        }

        // Add a random perturbation, between 0-20, to prevent identical edge weights and handle unrated cases
        weight += Math.random() * 20;

        // Floor the final weight and update the directed graph
        currentRow.push(Math.floor(weight));
      });

      directedGraph.push(currentRow);
    });

    if (!this.isSimulation) {
      // execute matching script
      log.info(`running Python script at ${ PAIR_SCRIPT }`);

      const data = JSON.stringify({'directed_graph': directedGraph, 'undirected_graph': undirectedGraph});
      const cmd = `echo '${ data }' | python ${ PAIR_SCRIPT }`;
      log.info(`command sent to python script: ${ cmd }`);

      const matchingResults = JSON.parse(Meteor.wrapAsync(exec)(cmd));
      log.info(`script results: ${ JSON.stringify(matchingResults) }`);

      // check if stable matching was possible and return if so. otherwise, return mwm
      let partners = [];
      if (matchingResults['stable_matching'].length > 0) {
        partners = matchingResults['stable_matching'];
        log.info('Stable matching FOUND...using stable results.');
      } else {
        partners = matchingResults['mwm_matching'];
        log.info('Stable matching NOT FOUND...using MWM results.');
      }

      // avoiding duplicates
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
