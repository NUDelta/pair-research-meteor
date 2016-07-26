import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Tasks } from './tasks.js';
import { Schema } from '../schema.js';

export const updateTask = new ValidatedMethod({
  name: 'tasks.update',
  validate: new SimpleSchema({
    name: {
      type: String
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
    const record = Tasks.findOne({ userId: userId, groupId: groupId });
    if (record) {
      return Tasks.update(record._id, { $set: { name: name, task: task }});
    } else {
      return Tasks.insert({
        name: name,
        userId: userId,
        groupId: groupId,
        task: task
      });
    }

    // TODO: upsert doesn't work?
    //Tasks.upsert({
    //  name: name,
    //  userId: userId,
    //  groupId: groupId
    //}, {
    //  $set: {
    //    task: task
    //  }
    //});
  }
});

export const clearTask = new ValidatedMethod({
  name: 'tasks.remove',
  validate: Schema.GroupUserQuery.validator(),
  run({ userId, groupId }) {
    Tasks.update({ groupId: groupId, userId: userId }, { $unset: { task: 0 } });
  }
});
