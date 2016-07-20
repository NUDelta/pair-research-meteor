import './group_settings_pairing_history.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { _ } from 'meteor/stevezhu:lodash';

import { Pairings } from '../../api/pairings/pairings.js';
import { PairsHistory } from '../../api/pairs-history/pairs-history.js';
import { TasksHistory } from '../../api/tasks-history/tasks-history.js';
import { Schema } from '../../api/schema.js';

const PAIRS_PER_PAGE = 20;

Template.group_settings_pairing_history.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    offset: 0,
    maxOffset: 0
  });

  this.autorun(() => {
    const data = Template.currentData();
    // TODO: validate data here
    // TODO: this page probably will need loading for the subscriptions to all be ready
    const groupId = data.group._id;
    if (groupId) {
      this.subscribe('pairings.all.byGroup', groupId);
      this.subscribe('pairsHistory.byGroup', groupId);
      this.subscribe('tasksHistory.byGroup', groupId);
    }
    this.state.set('maxOffset', Math.floor(PairsHistory.find().count() / PAIRS_PER_PAGE) - 1);
  });
});

Template.group_settings_pairing_history.helpers({
  pairings() {
    const instance = Template.instance();
    return PairsHistory.find({}, {
      limit: PAIRS_PER_PAGE,
      skip: instance.state.get('offset') * PAIRS_PER_PAGE,
      sort: {
        timestamp: -1,
        pairingId: 1
      }
    });
  },
  offset() {
    const instance = Template.instance();
    return instance.state.get('offset');
  },
  maxOffset() {
    const instance = Template.instance();
    // TODO: this might not be scaleabe?
    return instance.state.get('maxOffset');
  },
  offsets() {
    return _.range(0, PairsHistory.find().count(), PAIRS_PER_PAGE);
  },
  task(userId, pairingId) {
    const task= TasksHistory.findOne({ userId, pairingId });
    return task && task.task;
  },
});

Template.group_settings_pairing_history.events({
  'click a[href=#set-page]'(event, instance) {
    const pageNumber = $(event.target).data('index');
    instance.state.set('offset', pageNumber);
  },
  'click a[href=#page-left]'(event, instance) {
    const offset = instance.state.get('offset');
    if (offset > 0) {
      instance.state.decrement('offset');
    }
  },
  'click a[href=#page-right]'(event, instance) {
    const offset = instance.state.get('offset');
    const max = instance.state.get('maxOffset');
    if (offset < max) {
      instance.state.increment('offset');
    }
  },
});