import { Meteor } from 'meteor/meteor';

Meteor.publish('users.inGroup', function(groupId) {
  if (!this.userId) {
    this.ready();
  } else {
    return Meteor.users.find({
      groups: groupId
    }, {
      fields: { username: 1 }
    });
  }
});
