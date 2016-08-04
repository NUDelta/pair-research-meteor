import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { TasksHistory } from '../tasks-history.js';
import { Auth, authenticate } from '../../authentication.js';

Meteor.publish('tasksHistory.byGroup', function(groupId) {
  authenticate(Auth.GroupMember, this.userId, groupId);
  return TasksHistory.find({ groupId });
});
