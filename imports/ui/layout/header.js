import './header.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { _ } from 'meteor/stevezhu:lodash';

Template.header.onCreated(function() {
  const userHandle = this.subscribe('user.groups');

  this.state = new ReactiveDict();
  this.state.setDefault({
    groups: []
  });
  this.autorun(() => {
    if (userHandle.ready()) {
      this.state.set('groups', Meteor.user().groups);
    }
  });
});

Template.header.helpers({
  pendingGroups() {
    const instance = Template.instance();
    const groups = instance.state.get('groups');
    return _.filter(groups, membership => membership.role.weight === 1).length;
  }
});
