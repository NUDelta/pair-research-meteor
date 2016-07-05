import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Schema } from '../schema';

class TaskCollection extends Mongo.Collection {
  insert(task, callback) {
    return super.insert(task, callback);
  }
}

export const Tasks = new TaskCollection('tasks');

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
