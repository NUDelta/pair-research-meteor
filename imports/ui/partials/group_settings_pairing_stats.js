import './group_settings_pairing_stats.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Pairings } from '../../api/pairings/pairings.js';
import { PairsHistory } from '../../api/pairs-history/pairs-history.js';
import { AffinitiesHistory } from '../../api/affinities-history/affinities-history.js';
import { TasksHistory } from '../../api/tasks-history/tasks-history.js';
import { Schema } from '../../api/schema.js';

Template.group_settings_pairing_stats.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    selected: ''
  });
  this.autorun(() => {
    const data = Template.currentData();
    if (!_.isEmpty(data) && !_.isEmpty(data.group)) {
      Schema.Group.validate(data.group);
      const groupId = data.group._id;
      this.subscribe('pairings.all.byGroup', groupId);
      this.subscribe('pairsHistory.byGroup', groupId);
      this.subscribe('tasksHistory.byGroup', groupId);
    }
  });

  this.constructQuery = (type) => {
    const value = this.state.get('selected');
    let query = {};
    if (type == 'user') {
      query = { userId: value };
    } else if (type == 'role') {

    }
    return query;
  };

  this.constructPairingQuery = (type) => {
    const value = this.state.get('selected');
    let query = {};
    if (type == 'user') {
      query = {
        $or: [
          { firstUserId: value },
          { secondUserId: value }
        ]
      };
    } else if (type == 'role') {
      query = {
        $or: [
          { firstUserRole: value },
          { secondUserRole: value }
        ]
      };
    }
    return query;
  };
});

Template.group_settings_pairing_stats.onRendered(function() {
  $('ul.tabs').tabs();
});

Template.group_settings_pairing_stats.helpers({
  sessionCount() {
    return Pairings.find().count();
  },
  pairingCount() {
    return PairsHistory.find({ secondUserId: { $exists: true } }).count();
  },
  pairingCountSelected(type) {
    const instance = Template.instance();
    const query = instance.constructPairingQuery(type);
    return PairsHistory.find(query).count();
  },
  popularTasks(type) {
    // TODO: tweak count?
    const instance = Template.instance();
    const query = instance.constructQuery(type);
    return TasksHistory.popularTasks(query, 30);
  },
  topPartners() {
    const instance = Template.instance();
    const selected = instance.state.get('selected');
    if (selected) {
      return PairsHistory.topPartners(selected);
    }
  },
  topRolePartners() {
    const instance = Template.instance();
    const selected = instance.state.get('selected');
    if (selected) {
      return PairsHistory.topRolePartners(selected);
    }
  }
});

Template.group_settings_pairing_stats.events({
  'click .chip.clickable'(event, instance) {
    const $target = $(event.target);
    $('.chip.clickable').removeClass('active');
    $target.toggleClass('active');
    instance.state.set('selected', $target.data('id'));
  }
});
