import { Meteor } from 'meteor/meteor';

import { Tasks } from '../tasks.js';
import { Auth, authenticate } from '../../authentication.js';

Meteor.publish('tasks.inGroup', function(groupId) {
  authenticate(Auth.GroupMember, this.userId, groupId);
  return Tasks.find({
    groupId: groupId,
    task: { $exists: 1 }
  });
});

Meteor.publish('tasks.fromUserInGroup', function(groupId, userId) {
  authenticate(Auth.GroupMember, this.userId, groupId);
  return Tasks.find({
    groupId: groupId,
    userId: userId,
    task: { $exists: 1 }
  });
});
