import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Groups } from './groups.js';
import { Affinities } from '../affinities/affinities.js';
import { Tasks } from '../tasks/tasks.js';
import { Pairings } from '../pairings/pairings.js';
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
    const user = Meteor.users.findOne(userId);
    const taskRecord = Tasks.findOne({ userId: userId, groupId: groupId });
    if (!taskRecord) {
      Tasks.insert({
        name: user.username,
        userId: userId,
        task: '',
        groupId: groupId
      });
    }

    Meteor.users.update(userId, { $addToSet: { 'profile.groups': groupId }});
  }
});

export const clearGroupPool = new ValidatedMethod({
  name: 'groups.clearPool',
  validate: new SimpleSchema({
    groupId: {
      type: String,
      regEx: SimpleSchema.RegEx.Id
    }
  }).validator(),
  run({ groupId }) {
    Affinities.remove({ groupId: groupId });
    Tasks.remove({ groupId: groupId });
    Groups.update(groupId, { $unset: { activePairing: '' }});
  }
});

export const createRandomGroup = new ValidatedMethod({
  name: 'groups.createRandom',
  validate: null,
  run() {
    const randomGroupName = Math.random().toString(36).slice(2);
    return Groups.insert({
      groupName: randomGroupName,
      creatorId: this.userId
    });
  }
});