import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Tasks } from './tasks.js';
import { log } from '../logs.js';

export const updateTask = new ValidatedMethod({
  name: 'tasks.update',
  validate: new SimpleSchema({
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
  run({ userId, groupId, task }) {
    Tasks.update({
      userId: userId,
      groupId: groupId
    }, {
      $set: { task: task }
    });
  }
});