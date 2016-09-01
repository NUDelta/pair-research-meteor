import './groups_home_group.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

Template.groups_home_group.onRendered(function() {
  $('.tooltipped').tooltip();
});

Template.groups_home_group.helpers({
  showSettings(group) {
    return group.isAdmin(Meteor.userId());
  }
});
