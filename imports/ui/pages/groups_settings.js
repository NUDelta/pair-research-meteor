import './groups_settings.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.groups_settings.onCreated(function() {
  this.subscribe('users.inGroup', FlowRouter.getParam('groupId'));
});

Template.groups_settings.helpers({
  members() {
    return Meteor.users.find();
  }
});
