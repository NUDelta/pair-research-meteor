import { Meteor } from 'meteor/meteor';

import { Groups } from '../groups.js';
import { DEMO_GROUP_CREATOR } from '../../users/users.js';
import { Auth, authenticated } from '../../authentication.js';

Meteor.publish('group.byId', function(groupId) {
  if (authenticated(Auth.GroupMember, this.userId, groupId)) {
    return Groups.find({ _id: groupId, active: true });
  } else {
    this.ready();
  }
});

Meteor.publish('groups.user', function() {
  if (authenticated(Auth.LoggedIn, this.userId)) {
    return Groups.find({
      _id: { $in: Meteor.users.findUserGroups(this.userId) },
      active: true
    });
  } else {
    this.ready();
  }
});

Meteor.publish('groups.demo.byId', function(groupId) {
  return Groups.find({
    _id: groupId,
    active: true,
    creatorId: DEMO_GROUP_CREATOR
  });
});

