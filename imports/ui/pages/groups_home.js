import './groups_home.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { _ } from 'meteor/stevezhu:lodash';

import { Groups } from '../../api/groups/groups.js';

import '../partials/groups_home_invite.js';

Template.groups_home.onCreated(function() {
  const userHandle = this.subscribe('user.groups');
  this.subscribe('groups.user');

  this.state = new ReactiveDict();
  this.state.setDefault({
    groups: [],
    pendingGroups: []
  });

  this.autorun(() => {
    if (userHandle.ready()) {
      const allGroups = Meteor.user().groups;
      if (allGroups.length === 0) {
        FlowRouter.go('/signup');
      } else {
        this.state.set('groups', _.map(
          _.filter(allGroups, group => !group.isPending),
          group => group.groupId
        ));
        this.state.set('pendingGroups', _.map(
          _.filter(allGroups, group => group.isPending),
          group => group.groupId
        ));
      }
    }
  });

});

Template.groups_home.helpers({
  groups() {
    const instance = Template.instance();
    return Groups.find({
      _id: { $in: instance.state.get('groups') }
    });
  },
  pendingGroups() {
    const instance = Template.instance();
    return Groups.find({
      _id: { $in: instance.state.get('pendingGroups') }
    });
  },
  inviteArgs(group) {
    return {
      group: group
    };
  }
});

