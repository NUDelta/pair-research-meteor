import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Tasks } from '../tasks/tasks.js';
import { log } from '../logs.js';

export const findGroupMembers = new ValidatedMethod({
  name: 'groups.findMembers',
  validate: new SimpleSchema({
    groupId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),
  run({ groupId }) {
    return Meteor.users.find({ $in: { 'profile.groups': groupId }});
  }
});

export const addToGroup = new ValidatedMethod({
  name: 'groups.add',
  validate: new SimpleSchema({
    groupId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    },
    userId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),
  run({ groupId, userId }) {
    let user = Meteor.users.findOne(userId);
    Meteor.users.update(userId, { $addToSet: { 'profile.groups': groupId }});
    Tasks.insert({
      name: user.username,
      userId: userId,
      task: '',
      groupId: groupId
    });
  }
});