import './signup.html';

import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';
import { _ } from 'lodash';

import { Groups } from '../../api/groups/groups.js';
import { acceptInvite } from '../../api/groups/methods.js';
import { setProfile } from '../../api/users/methods.js';
import { doneCallback } from '../../startup/client/accounts.js';

Template.signup.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    step: 1,
    groups: [],
    email: FlowRouter.getQueryParam('email'),
    token: FlowRouter.getQueryParam('token'),
    avatar: 'https://dl.dropboxusercontent.com/s/5ybsquz1ypcku42/profile.png?dl=0'
  });

  let userHandle, groupsHandle;
  this.autorun(() => {
    userHandle = this.subscribe('user.groups');
    groupsHandle = this.subscribe('groups.user');
    if (userHandle.ready() && groupsHandle.ready()) {
      const user = Meteor.user();
      this.state.set('groups', user && user.groups);
    }
  });

  // TODO: this is a bit weird...disable if in a non pending group?
  if (Meteor.userId() || Meteor.loggingIn()) {
    this.state.set('step', 2);
  }
});

Template.signup.onRendered(function() {
  // TODO: make animations better! they suck a bit
  // this code could probably be generalized
  const animateIn = 'animated fast rollIn';
  const animateOut = 'animated fast rollOut';
  $('.signup-content').get(0)._uihooks = {
    insertElement(node, next) {
      const $node = $(node);
      $node.addClass(animateIn).insertBefore(next);
    },
    removeElement(node) {
      const $node = $(node);
      $node.addClass(animateOut);
      $node.on('transitionend', () => { $node.remove(); });
    }
  };

  $('.modal').modal();
});

Template.signup.helpers({
  step() {
    const instance = Template.instance();
    return instance.state.get('step');
  },
  groups() {
    const instance = Template.instance();
    return instance.state.get('groups');
  },
  user() {
    const instance = Template.instance();
    const user = { email: instance.state.get('email') };
    if (user.email) {
      user.disabled = 'disabled';
      user.class = 'active';
    }
    return user;
  },
  avatar() {
    const instance = Template.instance();
    return instance.state.get('avatar');
  },
  roles(groupId) {
    const group = Groups.findOne(groupId);
    return group && group.roles;
  }
});

Template.signup.events({
  'click .modal-close'(event, instance) {
    const avatar = $('#avatar').val();
    instance.state.set('avatar', avatar);
  },
  'submit #step1 form'(event, instance) {
    event.preventDefault();
    
    const user = {
      email: event.target.email.value,
      password: event.target.password.value,
      profile: _.pickBy({ // filter out falsey values
        fullName: event.target.fullName.value,
        avatar: instance.state.get('avatar')
      })
    };

    const token = instance.state.get('token');
    if (token) {
      Accounts.resetPassword(token, user.password, (err) => {
        if (err) {
          alert(err);
        } else {
          if (doneCallback) {
            doneCallback();
          }
          setProfile.call({ profile: user.profile }, (err) => {
            if (err) {
              // TODO: fix dead end
              // @see https://trello.com/c/5rpyN70S/112-possible-dead-end-when-creating-account-from-eamil
              alert(err);
            }
            instance.state.increment('step');
          });
        }
      });
    } else {
      Accounts.createUser(user, (err) => {
        if (err) {
          alert(err);
        } else {
          instance.state.increment('step');
        }
      });
    }
  },
  'submit #step2 form'(event, instance) {
    event.preventDefault();
    const groups = instance.state.get('groups');

    if (!_.every(groups, group => $(`select[data-group=${ group.groupId }]`).val())) {
      alert('Please enter roles for all the groups.');
    } else {
      groups.forEach((group) => {
        const roleTitle = $(`select[data-group=${ group.groupId }]`).val();
        acceptInvite.call({
          groupId: group.groupId,
          roleTitle
        }, (err) => {
          if (err) {
            alert(err);
          }
        });
      });
      FlowRouter.go('/groups');
    }
  }
});

