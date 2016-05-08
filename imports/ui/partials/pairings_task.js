import './pairings_task.html';

import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import {
  updateAffinity
} from '../../api/affinities/methods.js';

Template.pairings_task.events({
  'change input[type=radio]'(event, instance) {
    updateAffinity.call({
      helperId: instance.data.userId,
      helpeeId: instance.data.task.userId,
      groupId: instance.data.task.groupId,
      value: parseFloat(event.target.value)
    });
  }
});

Template.pairings_task.helpers({
  isSelected(value) {
    const data = Template.currentData();
    if (data.affinity && data.affinity.value === value) {
      return 'checked';
    } else {
      return '';
    }
  }
});

