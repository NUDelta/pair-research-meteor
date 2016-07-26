import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/stevezhu:lodash';

import { Schema } from '../schema.js';

const ignoreWords = ['and','the','to','a','of','for','as','i','with','it','is','on','that','this','can','in','be','has','if'];
const ignore = _.zipObject(ignoreWords, _.times(ignoreWords.length, _.constant(true)));
class TasksHistoryCollection extends Mongo.Collection {
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

export const TasksHistory = new TasksHistoryCollection('tasks_history');

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
