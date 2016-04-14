import './pair_task.html';

import { Template } from 'meteor/templating';

import { Affinities } from '../../api/affinities/affinities.js';

import {
  updateAffinity
} from '../../api/affinities/methods.js';

Template.pair_task.events({
  'change input[type=range]'(event, instance) {
    updateAffinity.call({
      helperId: Meteor.userId(),
      helpeeId: instance.data.task.userId,
      groupId: instance.data.task.groupId,
      value: parseInt(event.target.value)
    });
  }
});

