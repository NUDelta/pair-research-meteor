import './groups_create.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { _ } from 'meteor/stevezhu:lodash';

import { DefaultRoles } from '../../api/groups/groups.js';
import { createGroupWithMembers } from '../../api/groups/methods.js';


Template.groups_create.onCreated(function() {
  const defaultRoles = [ DefaultRoles.Admin, DefaultRoles.Member ];

  this.state = new ReactiveDict();
  this.state.setDefault({
    members: [],
    roleTitles: defaultRoles,
    editing: _.map(defaultRoles, () => false),
  });

  this.updateSelect = () => {
    Tracker.afterFlush(() => {
      $('select').material_select();
    })
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
      const err = this.addMember(email);
      if (err) {
        duplicates.push(err);
      }
    });
    if (duplicates.length) {
      alert(`[${ duplicates }] is/are duplicates and not added.`);
    }
    email.value = '';
  };

  this.addMember = (email) => {
    const exists = _.some(this.state.get('members'), member => member.email == email) || Meteor.user().email() == email;
    if (!exists) {
      const member = {
        email: email,
        isAdmin: false
      };
      this.state.push('members', member);
    } else {
      return email;
    }
  };

  this.setRoleTitle = (index, title) => {
    let roleTitles = this.state.get('roleTitles');
    roleTitles[index] = title;
    this.state.set('roleTitles', roleTitles);
    this.updateSelect();
  };

  this.removeRole = (index) => {
    let roleTitles = this.state.get('roleTitles');
    roleTitles.splice(index, 1);
    this.state.set('roleTitles', roleTitles);
    this.updateSelect();
  };

  this.toggleRoleEditing = (index) => {
    let editing = this.state.get('editing');
    editing[index] = !editing[index];
    this.state.set('editing', editing);
  };

  this.isEditing = (index) => {
    return this.state.get('editing')[index];
  };

  // add a test member
  this.addMember('hello@test.com');
  this.updateSelect();
});

Template.groups_create.helpers({
  members() {
    const instance = Template.instance();
    return instance.state.get('members');
  },
  roleTitles() {
    const instance = Template.instance();
    return instance.state.get('roleTitles');
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
    const roleTitles = instance.state.get('roleTitles');
    instance.state.push('roleTitles', '');
    instance.toggleRoleEditing(roleTitles.length);
    Tracker.afterFlush(() => {
      $(`input[name=${ roleTitles.length }-role-name]`).focus();
    });
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
  'click .members .secondary-content'(event, instance) {
    event.preventDefault();
    const index = $(event.currentTarget).data('index');
    instance.state.remove('members', index);
  },
  'click .members input[type=checkbox]'(event, instance) {
    const $target = $(event.target);
    const index = $target.data('index');
    const members = instance.state.get('members');
    members[index].isAdmin = $target.is(':checked');
    instance.state.set('members', members);
  },

  // submission
  'submit #group'(event, instance) {
    event.preventDefault();
    event.target.create.disabled = true;
    event.target.create.innerHTML = 'Creating...';

    const roleTitles = _.compact(instance.state.get('roleTitles'));
    const defaultRole = event.target.defaultRole.value;
    const members = _.map(instance.state.get('members'), (member) => {
      return _.extend(member, {
        roleTitle: defaultRole
      });
    });
    const group = {
      groupName: event.target.name.value,
      description: event.target.description.value,
      roleTitles: roleTitles,
      publicJoin: event.target.publicJoin.checked,
      allowGuests: event.target.allowGuests.checked,
      members: members,
      creatorRole: event.target.creatorRole.value
    };

    createGroupWithMembers.call(group, (err, groupId) => {
      if (err) {
        alert(err);
        event.target.create.disabled = false;
        event.target.create.innerHTML = 'Create';
      } else {
        FlowRouter.go('/groups', { groupId: groupId });
      }
    });
  }
});
