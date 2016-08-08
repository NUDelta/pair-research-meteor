import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/stevezhu:lodash';

import { Schema } from '../schema.js';

const ignoreWords = ['and','the','to','a','of','for','as','i','with','it','is','on','that','this','can','in','be','has','if'];
const ignore = _.zipObject(ignoreWords, _.times(ignoreWords.length, _.constant(true)));

/**
 * @summary Constructor for the stored history of tasks.
 * @class
 */
class TasksHistoryCollection extends Mongo.Collection {
  /**
   * Constructs query based on individual or all. Meant to be passed into `popularTasks`.
   * @param {string} type - either 'individual' or 'all, depending on set wanted.
   * @param {string} info - specifier for the selected type (e.g. userId for 'individual')
   * @returns {Object}
   * @todo Needs to implement role query. Tough, since role info currently isn't stored in task archive.
   */
  //noinspection JSMethodCanBeStatic
  constructQuery(type, info) {
    if (type == 'individual' && info) {
      return { userId: info };
    } else if (type == 'role' && info) {
      // hmm....TODO
    } else if (type == 'all') {
      return {};
    }
  }

  /**
   * Returns the most popular keywords in pairings tasks.
   * @param {Object} query - Task query. Meant to be either `{}` or `{ userId: 'something' }`
   * @param {number} count - Number of keywords desired.
   * @returns {Array}
   */
  popularTasks(query, count) {
    const tasks = _.map(this.find(query, { task: 1 }).fetch(), task => task.task);
    const frequencies = {};
    _.each(tasks, task => {
      const words = task.split(' ');
      _.each(words, word => {
        if (!ignore[word]) {
          frequencies[word] = frequencies[word] || 0;
          frequencies[word]++;
        }
      });
    });
    return _.slice(
      _.sortBy(
        _.map(frequencies, (frequency, word) => {
          return { word, frequency };
        }),
        wordf => wordf.frequency
      ),
      0, count);
  }
}

/**
 * @summary Collection hold current group tasks.
 * @exports
 * @analytics
 * @see Tasks
 * @type {TasksHistoryCollection}
 */
export const TasksHistory = new TasksHistoryCollection('tasks_history');

/**
 * @summary Schema for an archived task document.
 * @type {SimpleSchema}
 */
Schema.TaskHistory = new SimpleSchema({
  pairingId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  name: {
    type: String
  },
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  task: {
    type: String,
  },
  groupId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  }
});

TasksHistory.attachSchema(Schema.TaskHistory);
