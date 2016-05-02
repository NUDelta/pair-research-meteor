import { Meteor } from 'meteor/meteor';

import { Groups } from '../groups.js';

Meteor.publish('groups.user', function() {
  if (!this.userId) {
    this.ready();
  } else {
    return Groups.find({
      _id: { $in: Meteor.users.findUserGroups(this.userId) }
    });
  }
});

Meteor.publish('groups.byId', function(groupId) {
  if (!this.userId) {
    this.ready();
  } else {
    return Groups.find({
      $and: [
        {
          _id: { $in: Meteor.users.findUserGroups(this.userId) }
        },
        {
          _id: groupId
        }
      ]
    });
  }
})
