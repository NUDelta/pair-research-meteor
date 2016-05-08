import './pair.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Groups } from '../../api/groups/groups.js';
import { Tasks } from '../../api/tasks/tasks.js';

import '../components/pairings.js';
import '../partials/pair_enter_task.js';

Template.pair.onCreated(function() {
  const groupId = FlowRouter.getParam('groupId');
  const groupHandle = this.subscribe('groups.byId', groupId);
  const taskHandle = this.subscribe('tasks.fromUserInGroup', groupId);

  this.state = new ReactiveDict();
  this.state.setDefault({
    groupId: groupId
  });

  this.autorun(() => {
    if (groupHandle.ready()) {
       // TODO: There's a bit of a delay before this is processed. Continue to use loading?
       // TODO: people can see all groups with autojoin settings turned on. I think this is fine for
      // now, but for future...
      const group = Groups.findOne(groupId);
      if (!group) {
        FlowRouter.go('/groups');
      } else {
        this.state.set('group', group);
      }
    }
  });
});

Template.pair.helpers({
  currentTask() {
    const task = Tasks.findOne({ userId: Meteor.userId() });
    return task && task.task;
  },
  pairingArgs() {
    const instance = Template.instance();
    return {
      group: instance.state.get('group'),
      user: {
        _id: Meteor.userId(),
        name: Meteor.user().username
      }
    };
  },
  pairEnterTaskArgs() {
    const instance = Template.instance();
    // TODO: passing through task is unnecessary if we want to actually clear input on clicking
    // the clearTask button. But if we want to value to exist (e.g. to edit, then this doesn't work.
    return {
      groupId: instance.state.get('groupId'),
      task: Tasks.findOne()
    };
  }
});

