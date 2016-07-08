import './groups_create.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { _ } from 'meteor/stevezhu:lodash';

import { DefaultRoles } from '../../api/groups/groups.js';
import { createGroupWithMembers } from '../../api/groups/methods.js';

const roles = [ DefaultRoles.Admin, DefaultRoles.Member ];

Template.groups_create.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    members: [],
    roles: roles,
    editing: _.map(roles, () => false)
  });

  this.updateSelect = () => {
    Tracker.afterFlush(() => {
      $('select').material_select();
    });
  };

  this.addMember = () => {
    const email = document.getElementById('member');
    const $email = $(email);
    const exists = _.some(this.state.get('members'), member => member.email == email.value);
    const roles = this.state.get('roles');

    if (email.checkValidity() && !exists) {
      $email.removeClass('invalid');
      // TODO: replace with selected role from above
      const member = {
        email: email.value,
        role: roles[1].title
      };
      this.state.push('members', member);
      email.value = '';

      this.updateSelect();
    } else {
      $email.addClass('invalid');
    }
  };

  this.setRoleTitle = (index, title) => {
    let roles = this.state.get('roles');
    roles[index].title = title;
    this.state.set('roles', roles);
    this.updateSelect();
  };

  this.setRoleWeight = (index, weight) => {
    let roles = this.state.get('roles');
    roles[index].weight = weight;
    this.state.set('roles', roles);
  };

  this.removeRole = (index) => {
    let roles = this.state.get('roles');
    roles.splice(index, 1);
    this.state.set('roles', roles);
    this.updateSelect();
  };

  this.toggleRoleEditing = (index) => {
    let editing = this.state.get('editing');
    editing[index] = !editing[index];
    this.state.set('editing', editing);
  };

  this.isEditing = (index) => {
    return this.state.get('editing')[index];
  }
});

Template.groups_create.helpers({
  members() {
    const instance = Template.instance();
    return instance.state.get('members');
  },
  roles() {
    const instance = Template.instance();
    return instance.state.get('roles');
  },
  isAdmin(index) {
    const instance = Template.instance();
    const roles = instance.state.get('roles');
    if (roles[index].weight === DefaultRoles.Admin.weight) {
      return 'checked';
    } else {
      return '';
    }
  },
  isEditing(index) {
    const instance = Template.instance();
    return instance.isEditing(index);
  }
});

Template.groups_create.events({
  'keypress form'(event, instance) {
    if (event.which === 13) {
      event.preventDefault();
    }
  },
  'keypress input[name=member]'(event, instance) {
    if (event.which === 13) {
      event.preventDefault();
      event.stopPropagation();
      instance.addMember();
    }
  },
  'click #addMember'(event, instance) {
    instance.addMember();
  },
  'click .secondary-content'(event, instance) {
    event.preventDefault();
    const index = $(event.currentTarget).data('index');
    instance.state.remove('members', index);
  },

  // editing roles
  'click .roles .disabled'(event, instance) {
    instance.state.push('roles', { title: 'New', weight: DefaultRoles.Member.weight });
  },
  'change .roles [type=checkbox]'(event, instance) {
    const index = $(event.target).data('index');
    const weight = event.target.checked ? 100 : 10;
    instance.setRoleWeight(index, weight);
  },
  'click .roles a.secondary-content'(event, instance) {
    const index = $(event.currentTarget).data('index');
    instance.removeRole(index);
  },
  'click .roles .role-left .material-icons'(event, instance) {
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
  'submit #group'(event, instance) {
    event.preventDefault();

    const roles = instance.state.get('roles');
    const members = _.map(instance.state.get('members'), (member) => {
      member.role = _.find(roles, role => role.title == member.role);
      return member
    });
    const group = {
      groupName: event.target.name.value,
      description: event.target.description.value,
      roles: roles,
      publicJoin: event.target.publicJoin.checked,
      allowGuests: event.target.allowGuests.checked,
      members: members
    };

    createGroupWithMembers.call(group, (err, groupId) => {
      if (err) {
        alert(err)
      } else {
        FlowRouter.go('/pair/:groupId', { groupId: groupId });
      }
    });
  }
});
