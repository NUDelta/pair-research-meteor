import { Meteor } from 'meteor/meteor';

import { Tasks } from '../tasks.js';

Meteor.publish('tasks.inGroup', function(groupId) {
  return Tasks.find({
    groupId: groupId,
    task: { $exists: 1 }
  });
});

Meteor.publish('tasks.fromUserInGroup', function(groupId, userId) {
  return Tasks.find({
    groupId: groupId,
    userId: userId,
    task: { $exists: 1 }
  });
});
