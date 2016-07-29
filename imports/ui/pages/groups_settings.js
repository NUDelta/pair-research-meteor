import './groups_settings.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { _ } from 'meteor/stevezhu:lodash';

import { Groups } from '../../api/groups/groups.js';
import { processEmails } from '../../api/groups/util.js';
import {
  inviteToGroup,
  updateGroupInfo,
  updateMembership
} from '../../api/groups/methods.js';

import '../partials/groups_settings_roles.js';
import '../partials/groups_settings_member.js';
import '../partials/groups_settings_pairing_history.js';
import '../partials/groups_settings_pairing_stats.js';

Template.groups_settings.onCreated(function() {
  const groupId = FlowRouter.getParam('groupId');
  const groupHandle = this.subscribe('group.byId', groupId);
  this.subscribe('users.inGroup', groupId);

  this.state = new ReactiveDict();
  this.state.setDefault({
    groupId: groupId,
    group: {},
    members: [],
    section: 'group_roles',
    userChanges: {}
  });

  this.autorun(() => {
    if (groupHandle.ready()) {
      const group = Groups.findOne();
      this.state.set('group', group);
      this.state.set('members', group.members);
    }
  });

  this.updateSelect = () => {
    Tracker.afterFlush(() => {
      $('select').material_select();
    });
  };
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
    event.preventDefault();
    const section = event.target.getAttribute('href').slice(1);
    instance.state.set('section', section);
    instance.updateSelect();
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
    const members = instance.state.get('members');
    const roleTitle = event.currentTarget.inviteRole.value;
    processEmails(
      event.currentTarget.addMember.value,
      email => false, // not really a good way to do this, so just alert below
      email => {
        inviteToGroup.call({
          groupId: instance.state.get('groupId'),
          member: { email, roleTitle: roleTitle, isAdmin: false },
        }, err => {
          if (err && err.error == 'existing-user') {
            // think about this, alerting for each user could be annoying
            // would be hard to batch too...
            alert(`${ email } is already in the group.`);
          } else if (err) {
            alert(err);
          }
        });
      }
    );
    event.currentTarget.addMember.value = '';
  },
  'change .member-select select'(event, instance) {
    const $target = $(event.target);
    const newRole = $target.val();
    const userId = $target.data('user');

    const allUserChanges = instance.state.get('userChanges');
    const userChanges = allUserChanges[userId] || {};
    userChanges.roleTitle = newRole;
    instance.state.setKey('userChanges', userId, userChanges);
  },
  'click .member-select .collection-item:not(.pending) span.name'(event, instance) {
    const $target = $(event.target);
    const userId = $target.data('user');

    const members = instance.state.get('members');
    const index = _.findIndex(members, member => member.userId == userId);
    const isAdmin = !members[index].isAdmin;

    const allUserChanges = instance.state.get('userChanges');
    const userChanges = allUserChanges[userId] || {};
    userChanges.isAdmin = isAdmin;
    instance.state.setKey('userChanges', userId, userChanges);

    // update members state for ui
    members[index].isAdmin = isAdmin;
    instance.state.set('members', members);
  },
  'click #save-roles'(event, instance) {
    let success = true;
    let error;
    const userChanges = instance.state.get('userChanges');
    // TODO: should batch this
    _.forOwn(userChanges, (changes, userId) => {
      updateMembership.call({ roleTitle: changes.roleTitle, isAdmin: changes.isAdmin, userId, groupId: instance.state.get('groupId') }, (err) => {
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

