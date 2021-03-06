import { Meteor } from 'meteor/meteor';
import { _ } from 'lodash';

import { Groups } from '../../groups/groups.js';
import { ADMIN_ID } from '../../../startup/config.js'
import { Auth, authenticated } from '../../authentication.js';

Meteor.publish('user.groups', function() {
  if (authenticated(Auth.LoggedIn, this.userId)) {
    return Meteor.users.find(this.userId, { fields: { groups: 1 }});
  } else {
    this.ready();
  }
});

Meteor.publish('users.inGroup', function(groupId) {
  if (authenticated(Auth.GroupMember, this.userId, groupId)) {
    const group = Groups.findOne(groupId);
    if (group) {
      const memberIds = _.map(group.members, member => member.userId);
      return Meteor.users.find({ _id: { $in: memberIds } }, { fields: { profile: 1 } });
    } else {
      this.ready();
    }
  } else {
    this.ready();
  }

});

Meteor.publish('users.admin', function() {
  if (this.userId == ADMIN_ID) {
    return Meteor.users.find();
  } else {
    this.ready();
  }
});
