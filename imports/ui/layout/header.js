import './header.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/stevezhu:lodash';

Template.header.onCreated(function() {
  this.subscribe('user.groups');
});

Template.header.helpers({
  pendingGroups() {
    if (Meteor.userId()) {
      return _.filter(Meteor.user().groups, membership => membership.role === 1).length;
    } else {
      return 0;
    }
  }
});
