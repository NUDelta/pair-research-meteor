import { Meteor } from 'meteor/meteor';

import { Groups } from '../groups.js';

Meteor.publish('groups.user', function() {
  if (!this.userId) {
    this.ready();
  } else {
    const user = Meteor.users.findOne(this.userId);
    return Groups.find({
      _id: { $in: user.profile.groups }
    });
  }
});

Meteor.publish('groups.byId', function(groupId) {
  if (!this.userId) {
    this.ready();
  } else {
    const user = Meteor.users.findOne(this.userId);
    return Groups.find({
      $and: [
        {
          _id: { $in: user.profile.groups }
        },
        {
          _id: groupId
        }
      ]
    });
  }
})
