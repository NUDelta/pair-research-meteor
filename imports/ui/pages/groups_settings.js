import './groups_settings.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { _ } from 'meteor/stevezhu:lodash';

import { Groups } from '../../api/groups/groups.js';
import {
  inviteToGroup,
  updateGroupInfo,
  updateMembership
} from '../../api/groups/methods.js';

import '../partials/groups_settings_member.js';
import '../partials/group_settings_pairing_history.js';
import '../partials/group_settings_pairing_stats.js';

Template.groups_settings.onCreated(function() {
  const groupId = FlowRouter.getParam('groupId');
  const groupHandle = this.subscribe('group.byId', groupId);
  this.subscribe('users.inGroup', groupId);

  this.state = new ReactiveDict();
  this.state.setDefault({
    groupId: groupId,
    group: {},
    members: [],
    section: 'pairing_history',
    roleChanges: {}
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
    const instance = Template.instance();
    return instance.state.get('members');
  },
  memberArgs(member) {
    const instance = Template.instance();
    const group = instance.state.get('group');
    const user = Meteor.users.findOne(member.userId);

    return {
      member: member,
      avatar: user && user.avatar(),
      groupId: instance.state.get('groupId'),
      roles: group && group.roles
    };
  },
  isActive(section) {
    const instance = Template.instance();
    return instance.state.get('section') == section;
  },
  sectionArgs() {
    const instance = Template.instance();
    return {
      group: instance.state.get('group')
    };
  }
});

Template.groups_settings.events({
  'click .side-nav a.waves-effect'(event, instance) {
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
    const roles = instance.state.get('group').roles;
    inviteToGroup.call({
      groupId: instance.state.get('groupId'),
      member: {
        email: event.currentTarget.addMember.value,
        role: roles[0] // HACK: need to be able to specify role
      }
    });
  },
  'change .member-select select'(event, instance) {
    const $target = $(event.target);
    const $selected = $target.find('option:selected');
    const newRole = {
      title: $selected.val(),
      weight: $selected.data('weight')
    };
    instance.state.setKey('roleChanges', $target.data('user'), newRole);
  },
  'click #save-roles'(event, instance) {
    let success = true;
    let error;
    const roleChanges = instance.state.get('roleChanges');
    // TODO: should batch this
    // TODO: this is now invalid
    _.forOwn(roleChanges, (role, userId) => {
      updateMembership.call({ role, userId, groupId: instance.state.get('groupId') }, (err) => {
        if (err) {
          success = false;
          error = err;
        }
      });
    });

    // TODO: improve this error handling / confirmation
    if (!success) {
      alert(error);
    } else {
      alert('Update successful!');
    }
  }

});

