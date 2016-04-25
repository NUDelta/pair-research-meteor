import './pair_enter_task.html';

import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { updateTask } from '../../api/tasks/methods.js';

Template.pair_enter_task.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    groupId: Template.currentData().groupId
  });
});

Template.pair_enter_task.events({
  'submit form'(event, instance) {
    event.preventDefault();
    updateTask.call({
      name: Meteor.user().username,
      userId: Meteor.userId(),
      groupId: instance.state.get('groupId'),
      task: event.target.need.value
    });
  }
});
