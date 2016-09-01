import './groups_home_invite.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import {
  acceptInvite,
  removeFromGroup
} from '../../api/groups/methods.js';

Template.groups_home_invite.onRendered(function() {
  const data = Template.currentData();
  if (data.group) {
    $(`.tooltipped[data-id=${ data.group._id }]`).tooltip();
  }
});

Template.groups_home_invite.events({
  'click a[href=#accept]'(event, instance) {
    const roleTitle = $(event.currentTarget).prev('span').find('select').val();
    if (!roleTitle) {
      alert('Please select a role first.');
    } else {
      acceptInvite.call({
        groupId: instance.data.group._id,
        roleTitle
      });
    }
  },
  'click a[href=#reject]'(event, instance) {
    removeFromGroup.call({
      groupId: instance.data.group._id,
      userId: Meteor.userId()
    });
  }
});
