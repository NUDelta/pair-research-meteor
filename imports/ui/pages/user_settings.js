import './user_settings.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import { ReactiveDict } from 'meteor/reactive-dict';

import { setProfile } from '../../api/users/methods.js';
import { removeFromGroup } from '../../api/groups/methods.js';

Template.user_settings.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    avatar: '',
    groups: []
  });
  const userHandle = this.subscribe('user.groups');
  this.subscribe('groups.user'); // removeFromGroup throws an error otherwise without being able to determine membership

  this.autorun(() => {
    const avatar = Meteor.user() && Meteor.user().profile.avatar;
    this.state.set('avatar', avatar);

    if (userHandle.ready()) {
      this.state.set('groups', _.filter(Meteor.user().groups, group => !group.isPending));
    }
  });
});

Template.user_settings.helpers({
  avatar() {
    const instance = Template.instance();
    return instance.state.get('avatar');
  },
  groups() {
    const instance = Template.instance();
    return instance.state.get('groups');
  }
});

Template.user_settings.events({
  'change #avatar'(event, instance) {
    instance.state.set('avatar', event.currentTarget.value);
  },
  'submit form.about'(event, instance) {
    event.preventDefault();
    const profile = {
      fullName: event.target.fullName.value,
      avatar: event.target.avatar.value
    };
    setProfile.call({ profile }, err => {
      if (err) {
        alert(err);
      } else {
        alert('Profile updated!');
      }
    });
  },
  'change #confirmPassword'(event, instance) {
    // TODO: CSS validation seems to slow / inconsistent?
    event.currentTarget.setCustomValidity('');
  },
  'submit form.password'(event, instance) {
    event.preventDefault();
    event.target.change.disabled = true;
    const oldPassword = event.target.oldPassword.value;
    const newPassword = event.target.newPassword.value;
    const confirmPassword = event.target.confirmPassword.value;

    if (newPassword != confirmPassword) {
      event.target.confirmPassword.setCustomValidity('Passwords must match.');
      event.target.change.disabled = false;
    } else {
      Accounts.changePassword(oldPassword, newPassword, err => {
        if (err) {
          alert(err)
        } else {
          alert('Password successfully changed!');
          event.target.reset();
        }
        event.target.change.disabled = false;
      });
    }
  },

  'click .groups a[href=#delete]'(event, instance) {
    event.preventDefault();
    const groupId = $(event.currentTarget).data('id');
    // TODO: get name in there, make new component?
    if (confirm(`Are you sure you want to leave this group?`)) {
      removeFromGroup.call({
        groupId, userId: Meteor.userId()
      }, err => {
        if (err) {
          alert(err);
        }
      });
    }
  }
});
