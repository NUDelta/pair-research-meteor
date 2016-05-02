import './groups_settings_member.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Roles } from '../../api/users/users.js';

import {
  removeFromGroup
} from '../../api/groups/methods.js';

Template.group_settings_member.onCreated(function() {
  const data = Template.currentData();
  this.state = new ReactiveDict();
  this.state.set('group', _.find(data.member.groups, group => group.groupId == data.groupId));
  this.isPending = () => {
    // TODO: current user entry doesn't contain groups
    return Meteor.userId() != data.member._id &&
      this.state.get('group').role == Roles.Pending;
  };
});

Template.group_settings_member.helpers({
  pendingClass() {
    const instance = Template.instance();
    return instance.isPending() && 'pending';
  },
  pending() {
    const instance = Template.instance();
    return instance.isPending();
  }
});

Template.group_settings_member.events({
  'click i.material-icons'(event, instance) {
    removeFromGroup.call({
      userId: instance.data.member._id,
      groupId: instance.data.groupId
    });
  }
});
