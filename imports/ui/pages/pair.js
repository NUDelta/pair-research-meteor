import './pair.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Groups } from '../../api/groups/groups.js';
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
  this.subscribe('groups.byId', this.data.groupId);
  this.subscribe('tasks.inGroup', this.data.groupId);
  this.subscribe('affinities.inGroup', this.data.groupId);

  this.state = new ReactiveDict();
  this.state.setDefault({
    groupId: this.data.groupId
  });

});

Template.pair.onRendered(function() {
  Groups.find().observeChanges({
    changed(id, fields) {
      if (id && fields.activePairing) {
        // Scroll to pair results
        setTimeout(() => {
          $('body, html').animate({
            scrollTop: $('#pair_results').offset().top
          }, 1000);
        }, 500);
      }
    }
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
  },
  pairResultCreated() {
    const group = Groups.findOne();
    return group && group.activePairing;
  },
  pairResultArgs() {
    return {
      group: Groups.findOne()
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
