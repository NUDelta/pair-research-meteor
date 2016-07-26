import './groups_settings_member.html';

import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { DefaultRoles } from '../../api/groups/groups.js';
import { removeFromGroup } from '../../api/groups/methods.js';

Template.group_settings_member.onCreated(function() {
  this.state = new ReactiveDict();
  this.autorun(() => {
    const data = Template.currentData();
  });

  this._isRole = (role) => {
    const data = Template.currentData();
    return data.member.role.weight === role.weight;
  };
  this.isPending = () => {
    return this._isRole(DefaultRoles.Pending);
  };
  this.isAdmin = () => {
    return this._isRole(DefaultRoles.Admin);
  };
});

Template.group_settings_member.onRendered(function() {
  $('select').material_select();
});

Template.group_settings_member.helpers({
  pending() {
    const instance = Template.instance();
    const isPending = instance.isPending();
    return {
      isPending: isPending,
      class: isPending && 'pending'
    };
  },
  admin() {
    const instance = Template.instance();
    const isAdmin = instance.isAdmin();
    return {
      isAdmin,
      class: isAdmin && 'admin'
    };
  },
});

Template.group_settings_member.events({
  'click i.material-icons.delete'(event, instance) {
    if (confirm(`Are you sure you want to remove ${ instance.data.member.fullName } from the group?`)) {
      removeFromGroup.call({
        userId: instance.data.member.userId,
        groupId: instance.data.groupId
      });
    }
  }
});
