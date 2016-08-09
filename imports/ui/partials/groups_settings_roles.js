import './groups_settings_roles.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Random } from 'meteor/random';
import { _ } from 'lodash';

import { updateGroupRoles } from '../../api/groups/methods.js';

// TODO: This shares a bunch of code w/groups_create.js.
// Consider refactoring in the future if can figure out a
// way to share/bind data simply between these two components.

Template.groups_settings_roles.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    roles: [],
    editing: []
  });
  this.autorun(() => {
    const data = Template.currentData();
    if (data && data.group && data.group.roles) {
      this.state.set({
        roles: data.group.roles,
        editing: _.times(data.group.roles.length, false)
      });
    }
  });

  this.setRoleTitle = (index, title) => {
    let roles = this.state.get('roles');
    roles[index].title = title;
    this.state.set('roles', roles);
  };

  this.removeRole = (index) => {
    let roles = this.state.get('roles');
    roles.splice(index, 1);
    this.state.set('roles', roles);
  };

  this.toggleRoleEditing = (index) => {
    let editing = this.state.get('editing');
    editing[index] = !editing[index];
    this.state.set('editing', editing);
    Tracker.afterFlush(() => {
      $(`input[name=${ index }-role-name]`).focus();
    });
  };

  this.isEditing = (index) => {
    return this.state.get('editing')[index];
  };
});

Template.groups_settings_roles.helpers({
  roles() {
    const instance = Template.instance();
    return instance.state.get('roles');
  },
  isEditing(index) {
    const instance = Template.instance();
    return instance.isEditing(index);
  }
});

Template.groups_settings_roles.events({
  'click .roles .disabled'(event, instance) {
    const roles = instance.state.get('roles');
    instance.state.push('roles', { title: '', _id: Random.id() });
    instance.toggleRoleEditing(roles.length);
    Tracker.afterFlush(() => {
      $(`input[name=${ roles.length }-role-name]`).focus();
    });
  },
  'click .roles a.secondary-content'(event, instance) {
    event.preventDefault();
    const index = $(event.currentTarget).data('index');
    instance.removeRole(index);
  },
  'click .roles .role-left [data-index]:not(input)'(event, instance) {
    const $target = $(event.target);
    const index = $target.data('index');
    if (instance.isEditing(index)) {
      const title = $target.next().val();
      instance.setRoleTitle(index, title);
    }
    instance.toggleRoleEditing(index);
  },
  'keypress input.browser'(event, instance) {
    if (event.which === 13) {
      event.preventDefault();
      event.stopPropagation();
      const index = $(event.target).data('index');
      if (instance.isEditing(index)) {
        const title = event.target.value;
        instance.setRoleTitle(index, title);
        instance.toggleRoleEditing(index);
      }
    }
  },
  'click .pair-form-button'(event, instance) {
    const roles = instance.state.get('roles');
    const groupId = instance.data.group._id;

    updateGroupRoles.call({ roles, groupId }, err => {
      if (err) {
        alert(err);
      } else {
        alert('Roles saved!');
      }
    });
  }
});