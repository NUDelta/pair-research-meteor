import { Meteor } from 'meteor/meteor';

import { Tasks } from '../tasks.js';
import { Auth, authenticated } from '../../authentication.js';

Meteor.publish('tasks.inGroup', function(groupId) {
  if (authenticated(Auth.GroupMember, this.userId, groupId)) {
    return Tasks.find({
      groupId: groupId,
      task: { $exists: 1 }
    });
  } else {
    this.ready();
  }
});

Meteor.publish('tasks.fromUserInGroup', function(groupId, userId) {
  if (authenticated(Auth.GroupMember, this.userId, groupId)) {
    return Tasks.find({
      groupId: groupId,
      userId: userId,
      task: { $exists: 1 }
    });
  } else {
    this.ready();
  }
});
