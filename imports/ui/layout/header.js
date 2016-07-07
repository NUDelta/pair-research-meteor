import './header.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { ReactiveDict } from 'meteor/reactive-dict';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'meteor/stevezhu:lodash';

Template.header.onCreated(function() {
  const userHandle = this.subscribe('user.groups');

  this.state = new ReactiveDict();
  this.state.setDefault({
    groups: []
  });
  this.autorun(() => {
    if (userHandle.ready() && Meteor.userId()) {
      this.state.set('groups', Meteor.user().groups);
    }

    if (Meteor.userId()) {
      Tracker.afterFlush(() => {
        $('.dropdown-button').dropdown();
      });
    }
  });
});

Template.header.helpers({
  pendingGroups() {
    const instance = Template.instance();
    const groups = instance.state.get('groups');
    return _.filter(groups, membership => membership.role.weight === 1).length;
  }
});

Template.header.events({
  'click a[href=#signout]'(event, instance) {
    Meteor.logout((err) => {
      if (err) {
        alert(err);
      } else {
        FlowRouter.go('/');
      }
    });
  }
});
