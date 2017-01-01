import './pairings_task.html';

import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import '../components/avatar.js';

import {
  updateAffinity
} from '../../api/affinities/methods.js';

Template.pairings_task.events({
  'change input[type=radio], change select'(event, instance) {
    updateAffinity.call({
      helperId: instance.data.userId,
      helpeeId: instance.data.task.userId,
      groupId: instance.data.task.groupId,
      value: parseFloat(event.target.value)
    });
  }
});

Template.pairings_task.onRendered(function() {
  if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
    $('span.title').dotdotdot();
    $('.modal-trigger').leanModal({
      starting_top: '30%', // this doesn't work...overwriting in CSS
      ending_top: '40%'
    });
  }
});

Template.pairings_task.helpers({
  isChecked(value) {
    const data = Template.currentData();
    if (data.affinity && data.affinity.value === value) {
      return 'checked';
    } else {
      return '';
    }
  },
  isSelected(value) {
    const data = Template.currentData();
    if (data.affinity && data.affinity.value === value) {
      return 'selected';
    } else {
      return '';
    }
  }
});

