import './groups_home_group.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

Template.groups_home_group.onRendered(function() {
  const data = Template.currentData();
  if (data.group) {
    $(`.tooltipped[data-id=${ data.group._id }]`).tooltip();
  }
});

Template.groups_home_group.helpers({
  showSettings(group) {
    return group.isAdmin(Meteor.userId());
  }
});

Template.groups_home_group.events({
  'click a.tooltipped'(event, instance) {
    $('.tooltipped').tooltip('destroy');
  }
});
