import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Schema } from '../schema';

/**
 * @summary Constructor for the current tasks that people need to complete for Pair Research.
 * @placeholder
 * @class
 */
class TaskCollection extends Mongo.Collection {
  insert(task, callback) {
    return super.insert(task, callback);
  }
}

/**
 * @summary Collection holding the current tasks that people need to complete.
 * @exports
 * @type {TaskCollection}
 */
export const Tasks = new TaskCollection('tasks');

/**
 * @summary Schema for each task.
 * @type {SimpleSchema}
 */
Schema.Task = new SimpleSchema({
  name: {
    type: String
  },
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  task: {
    type: String,
    optional: true
  },
  groupId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  }
});

Tasks.attachSchema(Schema.Task);
