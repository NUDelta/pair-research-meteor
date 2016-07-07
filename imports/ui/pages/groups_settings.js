import './groups_settings.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Groups, DefaultRoles } from '../../api/groups/groups.js';
import {
  inviteToGroup,
  updateGroupInfo
} from '../../api/groups/methods.js';

import '../partials/groups_settings_member.js';

Template.groups_settings.onCreated(function() {
  const groupId = FlowRouter.getParam('groupId');
  const groupHandle = this.subscribe('group.byId', groupId);

  this.state = new ReactiveDict();
  this.state.setDefault({
    groupId: groupId,
    group: {},
    members: [],
    section: 'info'
  });

  this.autorun(() => {
    if (groupHandle.ready()) {
      const group = Groups.findOne();
      this.state.set('group', group);
      this.state.set('members', group.members);
    }
  })
});

Template.groups_settings.helpers({
  group() {
    const instance = Template.instance();
    return instance.state.get('group');
  },
  isChecked(attribute) {
    const instance = Template.instance();
    const group = instance.state.get('group');
    if (group && group[attribute]) {
      return 'checked';
    } else {
      return '';
    }
  },
  members() {
    // TODO: worry about filter options / sorting options
    // for now, just leave
    // currentUser is always here
    const instance = Template.instance();
    return instance.state.get('members');
  },
  memberArgs(member) {
    const instance = Template.instance();
    const group = instance.state.get('group');
    return {
      member: member,
      groupId: instance.state.get('groupId'),
      roles: group && group.roles
    };
  },
  isActive(section) {
    const instance = Template.instance();
    return instance.state.get('section') == section;
  }
});

Template.groups_settings.events({
  'click a.waves-effect'(event, instance) {
    const section = event.target.getAttribute('href').slice(1);
    instance.state.set('section', section);
  },
  'submit #groups_settings_info'(event, instance) {
    event.preventDefault();
    const group = {
      groupId: instance.state.get('groupId'),
      groupName: event.target.name.value,
      description: event.target.description.value,
      publicJoin: event.target.publicJoin.checked,
      allowGuests: event.target.allowGuests.checked
    };
    updateGroupInfo.call(group, (err, res) => {
      if (err) {
        alert(err);
      } else {
        alert('Changes saved!');
      }
    });
  },
  'submit #groups_settings_members_invite'(event, instance) {
    event.preventDefault();
    inviteToGroup.call({
      groupId: instance.state.get('groupId'),
      member: {
        email: event.currentTarget.addMember.value,
        role: DefaultRoles.Pending
      }
    });
  }
});

