import './groups_home_invite.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import {
  acceptInvite,
  removeFromGroup
} from '../../api/groups/methods.js';

Template.groups_home_invite.events({
  'click a[href=#accept]'(event, instance) {
    acceptInvite.call({
      groupId: instance.data.group.groupId
    });
  },
  'click a[href=#reject]'(event, instance) {
    removeFromGroup.call({
      groupId: instance.data.group.groupId,
      userId: Meteor.userId()
    });
  }
});
