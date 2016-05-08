import { Meteor } from 'meteor/meteor';

import { Tasks } from '../tasks.js';

Meteor.publish('tasks.inGroup', function(groupId) {
  return Tasks.find({
    groupId: groupId,
    task: { $exists: 1 }
  });
});

Meteor.publish('tasks.fromUserInGroup', function(groupId) {
  if (!this.userId) {
    this.ready();
  } else {
    return Tasks.find({
      groupId: groupId,
      userId: this.userId,
      task: { $exists: 1 }
    });
  }
});
