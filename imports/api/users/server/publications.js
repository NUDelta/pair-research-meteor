import { Meteor } from 'meteor/meteor';

import { ADMIN_ID } from '../../../startup/config.js'

Meteor.publish('user.groups', function() {
  if (!this.userId) {
    this.ready();
  } else {
    return Meteor.users.find(this.userId, { fields: { groups: 1 }});
  }
});

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
      fields: { profile: 1, groups: 1 } // TODO: exposing all groups is not desirable
    });
    // TODO: change this to a publication by retrieving user ids from group
  }
});

Meteor.publish('users.admin', function() {
  if (this.userId == ADMIN_ID) {
    return Meteor.users.find();
  } else {
    this.ready();
  }
});
