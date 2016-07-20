import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Schema } from '../schema.js';

class TasksHistoryCollection extends Mongo.Collection {

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
