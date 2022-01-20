import './pair_enter_task.html';

import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

// FIXME: This subscription takes up ~500KB on the client
// import { TasksHistory } from '../../api/tasks-history/tasks-history.js';
import { updateTask } from '../../api/tasks/methods.js';

Template.pair_enter_task.onCreated(function() {
  const groupId = Template.currentData().groupId;

  this.state = new ReactiveDict();
  this.state.setDefault({ groupId });

  // FIXME: This subscription takes up ~500KB on the client
  // this.subscribe('tasksHistory.byGroup', groupId);

});

// Template.pair_enter_task.onRendered(function() {
//   $('.input-tip').inputTooltip();
// });

Template.pair_enter_task.helpers({
  // FIXME: Calculating the popular tasks on the client side takes lots of time
  // popularTasks() {
  //   return TasksHistory.popularTasks({}, 20);
  // }
});

Template.pair_enter_task.events({
  'submit form'(event, instance) {
    event.preventDefault();
    updateTask.call({
      name: Meteor.user().profile.fullName,
      userId: Meteor.userId(),
      groupId: instance.state.get('groupId'),
      task: event.target.need.value
    });
  }
});
