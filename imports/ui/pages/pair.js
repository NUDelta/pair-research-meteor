import './pair.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Tasks } from '../../api/tasks/tasks.js';
import { Affinities } from '../../api/affinities/affinities.js';

import {
  updateTask
} from '../../api/tasks/methods.js';

import '../partials/pair_task.js';

Template.pair.onCreated(function() {
  let groupId = Meteor.user().profile.groups[0];

  this.subscribe('tasks.inGroup', groupId);
  this.subscribe('affinities');

  this.state = new ReactiveDict();
  this.state.setDefault({
    groupId: groupId
  });
});

Template.pair.helpers({
  groupTasks() {
    return Tasks.find();
  }
});

Template.pair.events({
  'change #need'(event, instance) {
    updateTask.call({
      userId: Meteor.userId(),
      groupId: instance.state.get('groupId'),
      task: event.target.value
    });
  }
});

