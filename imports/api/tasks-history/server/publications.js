import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { TasksHistory } from '../tasks-history.js';

Meteor.publish('tasksHistory.byGroup', function(groupId) {
  check(groupId, Match.Where(a => SimpleSchema.RegEx.Id.test(groupId)));
  if (!this.userId) {
    return this.ready();
  } else {
    // TODO: verify admin privileges
    return TasksHistory.find({ groupId });
  }
});
