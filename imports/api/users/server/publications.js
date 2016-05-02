import { Meteor } from 'meteor/meteor';

import { ADMIN_ID } from '../../../startup/config.js'

Meteor.publish('users.inGroup', function(groupId) {
  if (!this.userId) {
    this.ready();
  } else {
    return Meteor.users.find({
      groups: {
        $elemMatch: {
          groupId: groupId
        }
      }
    }, {
      fields: { username: 1 }
    });
  }
});

Meteor.publish('users.admin', function() {
  if (this.userId == ADMIN_ID) {
    return Meteor.users.find();
  } else {
    this.ready();
  }
});
