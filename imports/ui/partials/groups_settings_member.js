import './groups_settings_member.html';

import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { removeFromGroup } from '../../api/groups/methods.js';

Template.groups_settings_member.onCreated(function() {
  this.state = new ReactiveDict();
  this.autorun(() => {
    const data = Template.currentData();
  });
});

Template.groups_settings_member.onRendered(function() {
  $('select').material_select();
});

Template.groups_settings_member.helpers({
});

Template.groups_settings_member.events({
  'click i.material-icons.delete'(event, instance) {
    if (confirm(`Are you sure you want to remove ${ instance.data.member.fullName } from the group?`)) {
      removeFromGroup.call({
        userId: instance.data.member.userId,
        groupId: instance.data.groupId
      }, err => {
        if (err) {
          alert(err);
        }
      });
    }
  }
});
