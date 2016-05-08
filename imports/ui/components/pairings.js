import './pairings.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Groups } from '../../api/groups/groups.js';
import { Tasks } from '../../api/tasks/tasks.js';
import { Affinities } from '../../api/affinities/affinities.js';
import { Schema } from '../../api/schema.js';

import {
  clearTask,
} from '../../api/tasks/methods.js';

import {
  makePairings,
  PAIRING_IN_PROGRESS
} from '../../api/pairings/methods.js';

import {
  clearGroupPool
} from '../../api/groups/methods.js';

import '../partials/pair_task.js';
import '../partials/pair_results.js';

Template.pairings.onCreated(function() {
  this.state = new ReactiveDict();
  this.autorun(() => {
    const data = Template.currentData();

    new SimpleSchema({
      group: {
        type: Schema.Group
      },
      user: {
        type: Schema.SimpleUser
      }
    }).validate(data);

    const groupId = data.group._id;
    this.subscribe('groups.byId', groupId);
    this.subscribe('tasks.inGroup', groupId);
    this.subscribe('affinities.inGroup', groupId);

    this.state.setDefault({
      groupId: groupId,
      userId: data.user._id
    });
  });

  this.staticState = {};
  this.setSpinnerTimeout = () => {
    $('.preloader-wrapper').show();
    let interval = this.staticState.spinner;
    if (interval) {
      clearTimeout(interval);
    }
    interval = setTimeout(() => {
      $('.preloader-wrapper').fadeOut(500);
    }, 3000);
    this.staticState.spinner = interval;
  };
});

Template.pairings.onRendered(function() {
  const instance = this;

  Groups.find().observeChanges({
    changed(id, fields) {
      if (id && fields.activePairing) {
        if (fields.activePairing == PAIRING_IN_PROGRESS) {
          instance.setSpinnerTimeout();
        } else {
          // Scroll to pair results
          // setTimeout so UI elements have a chance to render
          setTimeout(() => {
            $('body, html').animate({
              scrollTop: $('#pair_results').offset().top
            }, 1000);
          }, 500);
        }
      }
    }
  });
});

Template.pairings.helpers({
  currentTask() {
    const instance = Template.instance();
    return Tasks.findOne({ userId: instance.state.get('userId') });
  },
  groupTasks() {
    const instance = Template.instance();
    return Tasks.find({ userId: { $ne: instance.state.get('userId') }});
  },
  userCount() {
    const instance = Template.instance();
    instance.setSpinnerTimeout();
    return Tasks.find().count();
  },
  affinityCount() {
    const instance = Template.instance();
    instance.setSpinnerTimeout();
    return Affinities.find().count();
  },
  pairTaskArgs(task) {
    const instance = Template.instance();
    instance.setSpinnerTimeout();
    return {
      task: task,
      affinity: Affinities.findOne({
        helperId: instance.state.get('userId'),
        helpeeId: task.userId
      })
    };
  },
  pairResultCreated() {
    const group = Groups.findOne();
    return group && group.activePairing && group.activePairing != PAIRING_IN_PROGRESS;
  },
  pairResultArgs() {
    return {
      group: Groups.findOne()
    };
  }
});

Template.pairings.events({
  'click #clearTask'(event, instance) {
    const userId = instance.state.get('userId');
    clearTask.call({ groupId: instance.state.get('groupId'), userId: userId });
  },

  'click #reset'(event, instance) {
    if (confirm('Are you sure you want to clear this pair research pool?')) {
      clearGroupPool.call({ groupId: instance.state.get('groupId') });
    }
  },

  'click #makePairs'(event, instance) {
    if (confirm('Ready to make pairs?')) {
      makePairings.call({ groupId: instance.state.get('groupId') });
    }
  }
});
