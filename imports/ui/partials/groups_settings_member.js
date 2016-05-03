import './groups_settings_member.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Roles } from '../../api/users/users.js';

import {
  removeFromGroup
} from '../../api/groups/methods.js';

Template.group_settings_member.onCreated(function() {
  this.state = new ReactiveDict();
  this.autorun(() => {
    const data = Template.currentData();
    this.state.set('group', _.find(data.member.groups, group => group.groupId == data.groupId));
  });

  this._isRole = (role) => {
    const group = this.state.get('group');
    return group && group.role == role;
  };
  this.isPending = () => {
    return this._isRole(Roles.Pending);
  };
  this.isAdmin = () => {
    return this._isRole(Roles.Admin);
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
  },
  adminClass() {
    const instance = Template.instance();
    return instance.isAdmin() && 'admin';
  },
  admin() {
    const instance = Template.instance();
    return instance.isAdmin();
  }
});

Template.group_settings_member.events({
  'click i.material-icons.delete'(event, instance) {
    removeFromGroup.call({
      userId: instance.data.member._id,
      groupId: instance.data.groupId
    });
  }
});
