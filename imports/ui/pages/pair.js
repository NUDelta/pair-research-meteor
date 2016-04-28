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

  const groupHandle = this.subscribe('groups.byId', groupId);
  this.subscribe('tasks.inGroup', groupId);
  this.subscribe('affinities.inGroup', groupId);

  this.autorun(() => {
    if (groupHandle.ready()) {
      const group = Groups.findOne(groupId);
      // TODO: There's a bit of a delay before this is processed. Continue to use loading?
      if (!group) {
        FlowRouter.go('/');
      }
    }
  });

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
      $('.preloader-wrapper').fadeOut(500);
    }, 3000);
    this.staticState.spinner = interval;
  };

});

Template.pair.onRendered(function() {
  Groups.find().observeChanges({
    changed(id, fields) {
      if (id && fields.activePairing) {
        // Scroll to pair results
        // setTimeout so UI elements have a chance to render
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
    const instance = Template.instance();
    instance.setSpinnerTimeout();
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
