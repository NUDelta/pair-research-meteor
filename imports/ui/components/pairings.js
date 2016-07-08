import './pairings.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Groups } from '../../api/groups/groups.js';
import { Tasks } from '../../api/tasks/tasks.js';
import { Affinities } from '../../api/affinities/affinities.js';
import { Schema } from '../../api/schema.js';

import {
  updateTask,
  clearTask,
} from '../../api/tasks/methods.js';

import {
  makePairings,
  PAIRING_IN_PROGRESS
} from '../../api/pairings/methods.js';

import {
  clearGroupPool
} from '../../api/groups/methods.js';

import {
  clearAffinities
} from '../../api/affinities/methods.js';

import '../partials/pairings_task.js';
import '../partials/pairings_results.js';

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
      },
      race: {
        type: Boolean,
        label: 'loading indicator type'
      }
    }).validate(data);

    const groupId = data.group._id;
    this.subscribe('groups.byId', groupId);
    this.subscribe('tasks.inGroup', groupId);
    this.subscribe('affinities.inGroup', groupId);
    this.subscribe('users.inGroup', groupId);

    this.state.setDefault({
      groupId: groupId,
      userId: data.user._id,
      editing: false
    });

    this.staticState = {};
    this.setSpinnerTimeout = () => {
      if (!this.data.race) {
        $('.preloader-wrapper').show();
        let interval = this.staticState.spinner;
        if (interval) {
          clearTimeout(interval);
        }
        interval = setTimeout(() => {
          $('.preloader-wrapper').fadeOut(500);
        }, 3000);
        this.staticState.spinner = interval;
      }
    };
  });
});

Template.pairings.onRendered(function() {
  const instance = this;
  Groups.find().observeChanges({
    changed(id, fields) {
      if (id && fields.activePairing) {
        if (fields.activePairing == PAIRING_IN_PROGRESS) {
          instance.setSpinnerTimeout();
        } else {
          Tracker.afterFlush(() => {
            $('body, html').animate({
              scrollTop: $('#pair_results').offset().top
            }, 1000);
          });
        }
      }
    }
  });
});

Template.pairings.helpers({
  editingTask() {
    const instance = Template.instance();
    return instance.state.get('editing');
  },
  currentTask() {
    const instance = Template.instance();
    return Tasks.findOne({ userId: instance.state.get('userId') });
  },
  groupTasks() {
    const instance = Template.instance();
    return Tasks.find({ userId: { $ne: instance.state.get('userId') }});
  },
  allTasks() {
    const instance = Template.instance();
    return Tasks.find();
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
      }),
      userId: instance.state.get('userId')
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
  },
  percentage(userId) {
    const totalCount = Tasks.find().count() - 1;
    const currentCount = Affinities.find({ helperId: userId }).count();
    return currentCount / totalCount * 100;
  },
  avatar(userId) {
    const user = Meteor.users.findOne(userId);
    return user && user.profile.avatar;
  }
});

Template.pairings.events({
  'click #leavePool'(event, instance) {
    const userId = instance.state.get('userId');
    const groupId = instance.state.get('groupId');
    clearTask.call({ groupId: groupId, userId: userId });
    clearAffinities.call({ groupId: groupId, userId: userId });
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
  },
  
  'click #editTask'(event, instance) {
    instance.state.set('editing', true);
  },

  'click #updateTask'(event, instance) {
    updateTask.call({
      name: $('input[name=username]').val(),
      userId: instance.state.get('userId'),
      groupId: instance.state.get('groupId'),
      task: $('input[name=task]').val()
    }, (err, res) => {
      if (err) {
        alert(err);
      } else {
        instance.state.set('editing', false);
      }
    });
  }
});
