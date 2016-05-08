import { Meteor } from 'meteor/meteor';

import { Groups } from '../groups.js';
import { DEMO_GROUP_CREATOR } from '../../users/users.js';

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
});

Meteor.publish('groups.demo.byId', function(groupId) {
  return Groups.find({
    _id: groupId,
    creatorId: DEMO_GROUP_CREATOR
  });
});
