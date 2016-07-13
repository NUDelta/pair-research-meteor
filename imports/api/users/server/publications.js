import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/stevezhu:lodash';

import { Groups } from '../../groups/groups.js';
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
    const group = Groups.findOne(groupId);
    if (!group) {
      this.ready();
    } else {
      const memberIds = _.map(group.members, member => member.userId);
      return Meteor.users.find({ _id: { $in: memberIds } }, { fields: { profile: 1 } });
    }
  }
});

Meteor.publish('users.admin', function() {
  if (this.userId == ADMIN_ID) {
    return Meteor.users.find();
  } else {
    this.ready();
  }
});
