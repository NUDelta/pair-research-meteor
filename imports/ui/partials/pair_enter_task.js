import './pair_enter_task.html';

import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { addToGroup } from '../../api/groups/methods.js';
import { updateTask } from '../../api/tasks/methods.js';
import { DEV_OPTIONS } from '../../startup/config.js';

Template.pair_enter_task.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    groupId: Template.currentData().groupId
  });
});

Template.pair_enter_task.events({
  'submit form'(event, instance) {
    event.preventDefault();
    if (DEV_OPTIONS.AUTOJOIN) {
      addToGroup.call({
        groupId: instance.state.get('groupId'),
        userId: Meteor.userId()
      });
    }
    updateTask.call({
      name: Meteor.user().username,
      userId: Meteor.userId(),
      groupId: instance.state.get('groupId'),
      task: event.target.need.value
    });
  }
});
