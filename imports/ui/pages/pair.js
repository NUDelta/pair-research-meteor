import './pair.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Groups } from '../../api/groups/groups.js';
import { Tasks } from '../../api/tasks/tasks.js';
import { Affinities } from '../../api/affinities/affinities.js';
import { log } from '../../api/logs.js';
import { DEV_OPTIONS } from '../../startup/config.js';

import {
  removeTask,
} from '../../api/tasks/methods.js';

import {
  makePairings,
} from '../../api/pairings/methods.js';

import {
  addToGroup,
  clearGroupPool
} from '../../api/groups/methods.js';

import '../partials/pair_enter_task.js';
import '../partials/pair_task.js';
import '../partials/pair_results.js';

Template.pair.onCreated(function() {
  const groupId = FlowRouter.getParam('groupId');
  // TODO: handle cases where groupId is not a real group

  if (DEV_OPTIONS.AUTOJOIN) {
    addToGroup.call({
      groupId: groupId,
      userId: Meteor.userId()
    });
  }

  this.subscribe('groups.byId', groupId);
  this.subscribe('tasks.inGroup', groupId);
  this.subscribe('affinities.inGroup', groupId);

  this.state = new ReactiveDict();
  this.state.setDefault({
    groupId: groupId,
    task: ''
  });

  this.staticState = {};

  this.setSpinnerTimeout = () => {
    $('.preloader-wrapper').show();
    let interval = this.staticState.spinner;
    if (interval) {
      clearTimeout(interval);
    }
    interval = setTimeout(() => {
      $('.preloader-wrapper').hide();
    }, 4000);
    this.staticState.spinner = interval;
  }
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
    const instance = Template.instance();
    instance.setSpinnerTimeout();
    return Tasks.find().count();
  },
  affinityCount() {
    const instance = Template.instance();
    instance.setSpinnerTimeout();
    return Affinities.find().count();
  },
  pairEnterTaskArgs() {
    const instance = Template.instance();
    return {
      groupId: instance.state.get('groupId'),
      task: instance.state.get('task')
    };
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
  'click #clearTask'(event, instance) {
    instance.state.set('task', Tasks.findOne({ userId: Meteor.userId() }));
    removeTask.call({ groupId: instance.state.get('groupId'), userId: Meteor.userId() });
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
