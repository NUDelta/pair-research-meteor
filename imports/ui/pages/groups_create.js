import './groups_create.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Groups } from '../../api/groups/groups.js';
import { createGroup } from '../../api/groups/methods.js';

Template.groups_create.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    members: []
  });
});

Template.groups_create.helpers({
  members() {
    const instance = Template.instance();
    return instance.state.get('members');
  }
});

Template.groups_create.events({
  'keypress input[name=member]'(event, instance) {
    if (event.which === 13 && event.target.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();

      // TODO: validation
      const member = event.currentTarget.value;
      instance.state.push('members', member);
      event.currentTarget.value = '';
    }
  },
  'click .secondary-content'(event, instance) {
    event.preventDefault();
    const index = $(event.currentTarget).data('index');
    instance.state.remove('members', index);
  },
  'submit #group'(event, instance) {
    event.preventDefault();

    const group = {
      groupName: event.target.name.value,
      creatorId: Meteor.userId(),
      members: instance.state.get('members')
    };

    createGroup.call(group, (err, groupId) => {
      if (err) {
        alert(err)
      } else {
        FlowRouter.go('/pair/:groupId', { groupId: groupId });
      }
    });
  }
});
