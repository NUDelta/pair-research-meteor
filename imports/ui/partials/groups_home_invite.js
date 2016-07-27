import './groups_home_invite.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import {
  acceptInvite,
  removeFromGroup
} from '../../api/groups/methods.js';


Template.groups_home_invite.events({
  'click a[href=#accept]'(event, instance) {
    const roleTitle = $(event.currentTarget).prev('span').find('select').val();
    acceptInvite.call({
      groupId: instance.data.group._id,
      roleTitle
    });
  },
  'click a[href=#reject]'(event, instance) {
    removeFromGroup.call({
      groupId: instance.data.group._id,
      userId: Meteor.userId()
    });
  }
});
