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
  this.state = new ReactiveDict();
  // TODO: generalize this for new users too
  this.state.setDefault({
    members: [],
    roles: DefaultRoles
  });
  this.addMember = () => {
    const email = document.getElementById('member');
    const $email = $(email);
    const exists = _.some(this.state.get('members'), member => member.email == email.value);
    if (email.checkValidity() && !exists) {
      $email.removeClass('invalid');
      // TODO: replace with selected role from above
      const member = {
        email: email.value,
        role: DefaultRoles[0].title
      };
      this.state.push('members', member);
      email.value = '';

      Tracker.afterFlush(() => {
        $('select').material_select();
      });
    } else {
      $email.addClass('invalid');
    }
  };
});

Template.groups_create.helpers({
  members() {
    const instance = Template.instance();
    return instance.state.get('members');
  },
  roles() {
    const instance = Template.instance();
    return instance.state.get('roles');
  }
});

Template.groups_create.events({
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
  'submit #group'(event, instance) {
    event.preventDefault();

    const roles = instance.state.get('roles');
    const members = _.map(instance.state.get('members'), (member) => {
      member.role = _.find(roles, role => role.title == member.role);
      return member
    });
    // TODO: tweak this for new users too
    // TODO: this is not yet tested
    const group = {
      groupName: event.target.name.value,
      description: event.target.description.value,
      creatorId: Meteor.userId(),
      creatorName: Meteor.user().profile.fullName,
      publicJoin: event.target.publicJoin.checked,
      allowGuests: event.target.allowGuests.checked,
      roles: roles,
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
