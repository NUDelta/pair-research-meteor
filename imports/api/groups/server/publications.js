import { Meteor } from 'meteor/meteor';

import { Groups } from '../groups.js';
import { DEMO_GROUP_CREATOR } from '../../users/users.js';
import { Auth, authenticate } from '../../authentication.js';

Meteor.publish('group.byId', function(groupId) {
  authenticate(Auth.GroupMember, this.userId, groupId);
  return Groups.find(groupId);
});

Meteor.publish('groups.user', function() {
  authenticate(Auth.LoggedIn, this.userId);
  return Groups.find({
    _id: { $in: Meteor.users.findUserGroups(this.userId) }
  });
});

Meteor.publish('groups.demo.byId', function(groupId) {
  return Groups.find({
    _id: groupId,
    creatorId: DEMO_GROUP_CREATOR
  });
});

