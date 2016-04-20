import { Meteor } from 'meteor/meteor';

import { Tasks } from '../tasks.js';

Meteor.publish('tasks.inGroup', function(groupId) {
  return Tasks.find({
    groupId: groupId,
    task: { $exists: 1 }
  });
});
