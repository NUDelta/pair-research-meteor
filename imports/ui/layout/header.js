import './header.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { ReactiveDict } from 'meteor/reactive-dict';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { _ } from 'lodash';

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
        $('.dropdown-trigger').dropdown({
          'coverTrigger': false,
        });
      });
    }
  });
});

Template.header.onRendered(function() {
  $('.sidenav').sidenav();
});

Template.header.helpers({
  pendingGroups() {
    const instance = Template.instance();
    const groups = instance.state.get('groups');
    return _.filter(groups, membership => membership.isPending).length;
  }
});

Template.header.events({
  'click a.signout'(event, instance) {
    event.preventDefault();
    Meteor.logout((err) => {
      if (err) {
        alert(err);
      } else {
        FlowRouter.go('/');
      }
    });
  }
});
