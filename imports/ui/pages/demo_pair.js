import './demo_pair.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Random } from 'meteor/random';

import { Groups } from '../../api/groups/groups.js';
import { Tasks } from '../../api/tasks/tasks.js';

import { updateTask } from '../../api/tasks/methods.js';

import '../components/pairings.js';

Template.demo_pair.onCreated(function() {
  const groupId = FlowRouter.getParam('groupId');
  const userId = Random.id();
  const groupHandle = this.subscribe('groups.demo.byId', groupId);
  this.subscribe('tasks.fromUserInGroup', groupId, userId);

  this.state = new ReactiveDict();
  this.state.set('groupId', groupId);
  this.state.set('userId', userId);

  this.autorun(() => {
    if (groupHandle.ready()) {
      // (cp from pair.js)
      // TODO: There's a bit of a delay before this is processed. Continue to use loading?
      // TODO: people can see all groups with autojoin settings turned on. I think this is fine for
      // now, but for future...
      const group = Groups.findOne(groupId);
      if (!group) {
        FlowRouter.go('/');
      } else {
        this.state.set('group', group);
      }
    }
  });
});

Template.demo_pair.helpers({
  currentTask() {
    // rerenders on all Task changes
    // do a static shift?
    // template-level subscriptions isolated?
    // static shift won't work well actually since inner form doesn't have context
    const instance = Template.instance();
    const task = Tasks.findOne({ userId: instance.state.get('userId') });
    return task && task.task;
  },
  pairingArgs() {
    const instance = Template.instance();
    const task = Tasks.findOne({ userId: instance.state.get('userId') });
    return {
      group: instance.state.get('group'),
      user: {
        _id: instance.state.get('userId'),
        name: task.name
      },
      race: false
    };
  }
});

Template.demo_pair.events({
  'submit form'(event, instance) {
    event.preventDefault();

    const name = event.target.username.value;
    const task = event.target.need.value;
    
    instance.state.set('name', name);
    instance.state.set('task', task);

    updateTask.call({
      name: name,
      userId: instance.state.get('userId'),
      groupId: instance.state.get('groupId'),
      task: task
    });
  }
});
