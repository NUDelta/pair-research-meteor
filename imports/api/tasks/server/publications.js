import { Meteor } from 'meteor/meteor';

import { Tasks } from '../tasks.js';

Meteor.publish('tasks.inGroup', function(groupId) {
  return Tasks.find({
    groupId: groupId,
    task: { $exists: 1 }
  });
  //if (!this.userId) {
  //  return this.ready();
  //} else {
  //  let groupId = Meteor.users.findOne(this.userId).profile.groups[0];
  //  return Tasks.find({ group: groupId });
  //}
});
