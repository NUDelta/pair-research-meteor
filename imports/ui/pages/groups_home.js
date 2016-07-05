import './groups_home.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import '../partials/groups_home_invite.js';

Template.groups_home.onCreated(function() {
  const userHandle = this.subscribe('user.groups');

  this.state = new ReactiveDict();
  this.state.setDefault({
    groups: []
  });

  this.autorun(() => {
    if (userHandle.ready()) {
      this.state.set('groups', Meteor.user().groups);
    }
  });

});

Template.groups_home.helpers({
  groups() {
    const instance = Template.instance();
    return _.filter(instance.state.get('groups'), group => group.role.weight !== 1);
  },
  pendingGroups() {
    const instance = Template.instance();
    return _.filter(instance.state.get('groups'), group => group.role.weight === 1);
  },
  inviteArgs(group) {
    return {
      group: group
    };
  }
});

