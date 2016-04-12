import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Tasks } from './tasks.js';
import { log } from '../logs.js';

export const updateTask = new ValidatedMethod({
  name: 'tasks.update',
  validate: new SimpleSchema({
    name: {
      type: String,
    },
    userId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    groupId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    task: {
      type: String
    }
  }).validator(),
  run({ name, userId, groupId, task }) {
    Tasks.upsert({
      name: name,
      userId: userId,
      groupId: groupId
    }, {
      $set: { task: task }
    });
  }
});