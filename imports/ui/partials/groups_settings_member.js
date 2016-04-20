import './groups_settings_member.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import {
  removeFromGroup
} from '../../api/groups/methods.js';

Template.group_settings_member.onCreated(function() {

});

Template.group_settings_member.events({
  'click i.material-icons'(event, instance) {
    removeFromGroup.call({
      userId: instance.data.member._id,
      groupId: instance.data.groupId
    });
  }
});
