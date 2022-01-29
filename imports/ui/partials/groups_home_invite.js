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
  'click a.accept-group-invite'(event, instance) {
    event.preventDefault();

    const roleTitle = $(event.currentTarget).prev('span').find('select').val();
    if (!roleTitle) {
      alert('Please select a role first.');
    } else {
      $(`.tooltipped[data-id=${ instance.data.group._id }]`).tooltip('destroy');
      acceptInvite.call({
        groupId: instance.data.group._id,
        roleTitle
      }, err => {
        if (err) {
          alert(err);
          $(`.tooltipped[data-id=${ instance.data.group._id }]`).tooltip();
        } else {
        }
      });
    }
  },
  'click a.reject-group-invite'(event, instance) {
    event.preventDefault();

    if (confirm(`Are you sure you want to delete ${instance.data.group.groupName }'s invitation? This action is not reversible.`)) {
      $(`.tooltipped[data-id=${ instance.data.group._id }]`).tooltip('destroy');
      removeFromGroup.call({
        groupId: instance.data.group._id,
        userId: Meteor.userId()
      }, err => {
        if (err) {
          alert(err);
          $(`.tooltipped[data-id=${ instance.data.group._id }]`).tooltip();
        } else {
        }
      });
    }
  }
});