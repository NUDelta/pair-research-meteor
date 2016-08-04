import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/stevezhu:lodash';

import { Groups } from '../../groups/groups.js';
import { ADMIN_ID } from '../../../startup/config.js'
import { Auth, authenticate } from '../../authentication.js';

Meteor.publish('user.groups', function() {
  authenticate(Auth.LoggedIn, this.userId);
  return Meteor.users.find(this.userId, { fields: { groups: 1 }});
});

Meteor.publish('users.inGroup', function(groupId) {
  authenticate(Auth.GroupMember, this.userId, groupId);
  const group = Groups.findOne(groupId);
  const memberIds = _.map(group.members, member => member.userId);
  return Meteor.users.find({ _id: { $in: memberIds } }, { fields: { profile: 1 } });
});

Meteor.publish('users.admin', function() {
  if (this.userId == ADMIN_ID) {
    return Meteor.users.find();
  } else {
    this.ready();
  }
});
