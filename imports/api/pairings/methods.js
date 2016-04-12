import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { _ } from 'meteor/stevezhu:lodash';
import { exec } from 'child_process';


import { Pairings } from './pairings.js';
import { Affinities } from '../affinities/affinities.js';
import { Tasks } from '../tasks/tasks.js';
import { Schema } from '../schema.js';
import { log } from '../logs';

import { PAIR_SCRIPT } from '../../startup/config.js';

export const makePairings = new ValidatedMethod({
  name: 'pairing.makePairings',
  validate: new SimpleSchema({
    groupId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),
  run({ groupId }) {

    // Form n^2 pool data
    const userPool = Tasks.find({ groupId: groupId }).fetch().map(task => task.userId);
    const scores = {};
    userPool.forEach((userId) => {
      scores[userId] = {};
      userPool.forEach((_userId) => {
        if (userId != _userId) {
          scores[userId][_userId] = 0;
        }
      });
    });

    Affinities.find().forEach((affinity) => {
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
        }
      });
    });

    if (!this.isSimulation) {
      //const data = '[(0, 1, 93), (0, 2, -20), (0, 3, 2), (1, 2, -13), (1, 3, 10), (2, 3, 80)]';
      const data = JSON.stringify(edges);
      log.info(data);
      const cmd = `echo '${ data }' | python ${ PAIR_SCRIPT }`;
      const execSync = Meteor.wrapAsync(exec);

      return execSync(cmd);
    } else {
      return 1;
    }
  }
});
