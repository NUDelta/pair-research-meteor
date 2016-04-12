import './pair.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Tasks } from '../../api/tasks/tasks.js';
import { Affinities } from '../../api/affinities/affinities.js';
import { log } from '../../api/logs.js';

import {
  updateTask,
} from '../../api/tasks/methods.js';

import {
  makePairings,
} from '../../api/pairings/methods.js';

import {
  clearGroupPool
} from '../../api/groups/methods.js';

import '../partials/pair_task.js';
import '../partials/pair_results.js';

Template.pair.onCreated(function() {
  let groupId = Meteor.user().profile.groups[0];

  this.subscribe('tasks.inGroup', groupId);
  this.subscribe('affinities.inGroup', groupId);

  this.state = new ReactiveDict();
  this.state.setDefault({
    groupId: groupId
  });
});

Template.pair.helpers({
  currentTask() {
    return Tasks.findOne({ userId: Meteor.userId() });
  },
  groupTasks() {
    return Tasks.find({ userId: { $ne: Meteor.userId() }});
  },
  userCount() {
    return Tasks.find().count();
  },
  affinityCount() {
    return Affinities.find().count();
  },
  pairTaskArgs(task) {
    return {
      task: task,
      affinity: Affinities.findOne({
        helperId: Meteor.userId(),
        helpeeId: task.userId
      })
    };
  }
});

Template.pair.events({
  'change #need'(event, instance) {
    updateTask.call({
      name: Meteor.user().username,
      userId: Meteor.userId(),
      groupId: instance.state.get('groupId'),
      task: event.target.value
    });
  },

  'click #reset'(event, instance) {
    clearGroupPool.call({ groupId: instance.state.get('groupId') });
  },

  'click #makePairs'(event, instance) {
    makePairings.call({ groupId: instance.state.get('groupId') }, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log(res);
      }
    });
  }
});
