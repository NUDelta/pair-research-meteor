import './groups_home.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

Template.groups_home.onCreated(function() {
  this.subscribe('user.groups');
});

Template.groups_home.helpers({
  groups() {
    return _.filter(Meteor.user().groups, group => group.role.weight !== 1);
  },
  pendingGroups() {
    return _.filter(Meteor.user().groups, group => group.role.weight === 1);
  }
});