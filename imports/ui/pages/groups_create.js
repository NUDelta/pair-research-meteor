import './groups_create.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { _ } from 'meteor/stevezhu:lodash';

import { DefaultRoles, RoleWeight } from '../../api/groups/groups.js';
import { createGroupWithMembers } from '../../api/groups/methods.js';

const defaultRoles = [ DefaultRoles.Admin, DefaultRoles.Member ];

Template.groups_create.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    members: [],
    roles: defaultRoles,
    editing: _.map(defaultRoles, () => false)
  });

  this.baseRole = () => {
    // TODO: this will probably be rather temporary thing
    const roles = this.state.get('roles');
    return roles[1].title || roles[0].title || 'No Role'
  };

  this.updateSelect = () => {
    Tracker.afterFlush(() => {
      $('select').material_select();
    });
  };

  this.updateMemberRoles = (oldTitle, newTitle) => {
    const members = this.state.get('members');
    this.state.set('members', _.map(members, (member) => {
      if (member.role == oldTitle) {
        member.role = newTitle;
      }
      return member
    }));
  };

  const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  this.addMembers = () => {
    const email = document.getElementById('member');

    const emails = _.compact(_.map(email.value.split(','), email => email.replace(/ /g, '')));
    const invalid = _.filter(emails, email => !re.test(email));
    const valid = _.filter(emails, email => re.test(email));
    if (invalid.length) {
      alert(`[${ invalid }] is/are not email addresses and will not be added.`);
    }
    let duplicates = [];
    valid.forEach((email) => {
      const res = this.addMember(email);
      if (res) {
        duplicates.push(res);
      }
    });
    if (duplicates.length) {
      alert(`[${ duplicates }] is/are duplicates and not added.`);
    }
    email.value = '';
  };

  this.addMember = (email) => {
    const exists = _.some(this.state.get('members'), member => member.email == email) || Meteor.user().email() == email;
    const roles = this.state.get('roles');

    if (!exists) {
      // TODO: replace with selected role from above
      const member = {
        email: email,
        role: this.baseRole()
      };
      this.state.push('members', member);
      this.updateSelect();
    } else {
      return email;
    }
  };

  this.setMemberRole = (index, roleTitle) => {
    let members = this.state.get('members');
    members[index].role = roleTitle;
    this.state.set('members', members);
  };

  this.setRoleTitle = (index, title) => {
    // TODO: check for duplicates
    let roles = this.state.get('roles');
    const oldTitle = roles[index].title;
    roles[index].title = title;

    this.state.set('roles', roles);
    this.updateSelect();
    this.updateMemberRoles(oldTitle, title);
  };

  this.setRoleWeight = (index, weight) => {
    let roles = this.state.get('roles');
    roles[index].weight = weight;
    this.state.set('roles', roles);
  };

  this.removeRole = (index) => {
    let roles = this.state.get('roles');
    const oldTitle = roles[index].title;
    roles.splice(index, 1);

    this.state.set('roles', roles);
    this.updateSelect();
    this.updateMemberRoles(oldTitle, this.baseRole());
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
    if (roles[index].weight === RoleWeight.Admin) {
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

  // editing roles
  'click .roles .disabled'(event, instance) {
    const roles = instance.state.get('roles');
    instance.state.push('roles', { title: '', weight: RoleWeight.Member });
    instance.toggleRoleEditing(roles.length);
    Tracker.afterFlush(() => {
      $(`input[name=${ roles.length }-role-name]`).focus();
    });
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

  // editing members
  'keypress input[name=member]'(event, instance) {
    if (event.which === 13) {
      event.preventDefault();
      event.stopPropagation();
      instance.addMembers();
    }
  },
  'click #addMember'(event, instance) {
    instance.addMembers();
  },
  'click .member-select .secondary-content'(event, instance) {
    event.preventDefault();
    const index = $(event.currentTarget).data('index');
    instance.state.remove('members', index);
  },

  'change select'(event, instance) {
    const index = $(event.target).data('index');
    const roleTitle = event.target.value;
    instance.setMemberRole(index, roleTitle);
  },

  // submission
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
        alert(err);
      } else {
        FlowRouter.go('/groups', { groupId: groupId });
      }
    });
  }
});
