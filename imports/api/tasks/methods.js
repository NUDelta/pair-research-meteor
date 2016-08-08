import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Tasks } from './tasks.js';
import { Schema } from '../schema.js';
import { Auth, AuthMixin } from '../authentication.js';

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
  mixins: [AuthMixin],
  allow: [Auth.GroupSelf],
  run({ name, userId, groupId, task }) {
    Tasks.upsert({
     name: name,
     userId: userId,
     groupId: groupId
    }, {
     $set: {
       task: task,
       name: name,
       userId: userId,
       groupId: groupId
     }
    });
  }
});

export const clearTask = new ValidatedMethod({
  name: 'tasks.remove',
  validate: Schema.GroupUserQuery.validator(),
  mixins: [AuthMixin],
  allow: [Auth.GroupSelf],
  run({ userId, groupId }) {
    Tasks.update({ groupId: groupId, userId: userId }, { $unset: { task: 0 } });
  }
});
