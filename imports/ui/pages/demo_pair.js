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
  const groupHandle = this.subscribe('groups.demo.byId', groupId);

  this.state = new ReactiveDict();
  this.state.set('groupId', groupId);

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
    const instance = Template.instance();
    const userId = instance.state.get('userId');
    if (userId) {
      const task = Tasks.findOne({ userId: userId });
      return task && task.task;
    }
  },
  pairingArgs() {
    const instance = Template.instance();
    return {
      group: instance.state.get('group'),
      user: {
        _id: instance.state.get('userId'),
        name: instance.state.get('name')
      }
    };
  }
});

Template.demo_pair.events({
  'submit form'(event, instance) {
    event.preventDefault();

    const name = event.target.username.value;
    const task = event.target.need.value;
    
    if (!instance.state.get('userId')) {
      instance.state.set('userId', Random.id());      
    }
    
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
