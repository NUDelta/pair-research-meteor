import './groups_home.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Groups } from '../../api/groups/groups.js';

Template.groups_home.onCreated(function() {
  this.subscribe('groups.user');
});

Template.groups_home.helpers({
  groups() {
    return Groups.find();
  }
});