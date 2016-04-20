import './groups_settings.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';

import '../partials/groups_settings_member.js';

Template.groups_settings.onCreated(function() {
  const groupId = FlowRouter.getParam('groupId');

  this.subscribe('users.inGroup', groupId);
  this.state = new ReactiveDict();
  this.state.setDefault({
    groupId: groupId
  });
});

Template.groups_settings.helpers({
  members() {
    return Meteor.users.find();
  },
  memberArgs(member) {
    const instance = Template.instance();
    return {
      member: member,
      groupId: instance.state.get('groupId')
    }
  }
});
