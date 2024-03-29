import './pairings.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { _ } from 'lodash';

import { Groups } from '../../api/groups/groups.js';
import { Tasks } from '../../api/tasks/tasks.js';
import { Affinities } from '../../api/affinities/affinities.js';
import { Schema } from '../../api/schema.js';
import { generateCustomAvatar } from '../../api/util.js';

import '../components/confetti.js';
import '../components/avatar.js';

import {
  updateTask,
  clearTask,
} from '../../api/tasks/methods.js';

import {
  makePairings,
  PAIRING_IN_PROGRESS
} from '../../api/pairings/methods.js';

import {
  clearGroupPool,
  undoPairs
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
    this.subscribe('group.byId', groupId);
    this.subscribe('tasks.inGroup', groupId);
    this.subscribe('affinities.inGroup', groupId);
    this.subscribe('users.inGroup', groupId);

    this.state.setDefault({
      groupId: groupId,
      userId: data.user._id,
      editing: false,
      raceResults: [],
      makingPairs: false
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
          instance.state.set('makingPairs', true);
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

  // setup tooltips
  $('.controls .tooltipped').tooltip();
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
    const instance = Template.instance();
    const totalCount = Tasks.find().count() - 1;
    const currentCount = Affinities.find({ helperId: userId }).count();

    const results = instance.state.get('raceResults');
    if (currentCount === totalCount) {
      if (totalCount > 0 && results.length < 3) {
        instance.state.addToSet('raceResults', userId);
      }
    } else {
      const exists = _.findIndex(results, res => res == userId);
      if (exists !== -1) {
        instance.state.removeIndex('raceResults', exists);
      }
    }
    return currentCount / totalCount * 100;
  },
  place(userId) {
    // race condition: see https://trello.com/c/aIYHGg29/106-race-condition
    const instance = Template.instance();
    const results = instance.state.get('raceResults');
    const index = _.findIndex(results, res => res == userId) + 1;
    return (index !== 0) && index;
  },
  placeLeft(percentage) {
    return `calc(${ percentage }% - 20px)`;
  },
  placeAvatar(place) {
    switch(place) {
      case 1:
        return generateCustomAvatar('1st', '#FFD700');
      case 2:
        return generateCustomAvatar('2nd', '#C0C0C0');
      case 3:
        return generateCustomAvatar('3rd', '#CD7F32');
    }
  },
  makingPairs() {
    const instance = Template.instance();
    return instance.state.get('makingPairs');
  }
});

Template.pairings.events({
  'click #leave-session'(event, instance) {
    if (confirm('Are you sure you want to leave this pairing session? You can rejoin, but your entered help request and ratings for others in the pool will disappear.')) {
      const userId = instance.state.get('userId');
      const groupId = instance.state.get('groupId');
      clearTask.call({ groupId: groupId, userId: userId });
      clearAffinities.call({ groupId: groupId, userId: userId });
    }
  },

  'click #reset'(event, instance) {
    if (confirm('Are you sure you want to clear this pair research pool? This action is not reversible.')) {
      clearGroupPool.call({ groupId: instance.state.get('groupId') });
    }
  },

  'click #cancel-pairs'(event, instance) {
    undoPairs.call({ groupId: instance.state.get('groupId') });
  },

  /**
   * Triggers make pairs.
   * @param event
   * @param instance
   * @todo This causes the Group Pairing listener to trigger twice: having no pair and
   *       having a new pairing, which oddly causes the bottom pairings area to disappear
   *       and reappear, which can cause confetti to fly down.
   * @see https://trello.com/c/TWLiuxC2/105-random-confetti
   */
  'click #make-pairs'(event, instance) {
    if (confirm('Ready to make pairs?')) {
      makePairings.call({ groupId: instance.state.get('groupId') });
    }
  },

  'click #edit-task'(event, instance) {
    instance.state.set('editing', true);
  },

  'click #update-task'(event, instance) {
    const data = Template.currentData();
    updateTask.call({
      name: data.user.name,
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
  },

  // TODO: this gets deinitialized before the tooltip is destroyed
  'click a.tooltipped'(event, instance) {
    $('.tooltipped').tooltip('destroy');
  }
});
