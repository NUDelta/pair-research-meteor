import './signup.html';

import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Groups, DefaultRoles } from '../../api/groups/groups.js';
import { acceptInvite } from '../../api/groups/methods.js';
import { setFullName } from '../../api/users/methods.js';
import { Schema } from '../../api/schema.js';

Template.signup.onCreated(function() {
  // TODO: filter publication fields
  this.subscribe('groups.user');

  this.state = new ReactiveDict();
  this.state.setDefault({
    step: 1,
    email: FlowRouter.getQueryParam('email'),
    token: FlowRouter.getQueryParam('token'),
    avatar: 'http://orig02.deviantart.net/cd44/f/2016/152/2/d/placeholder_3_by_sketchymouse-da4ny84.png'
  });
});

Template.signup.onRendered(function() {
  // TODO: make animations better! they suck a bit
  // this code could probably be generalized
  const animateIn = 'animated fast rollIn';
  const animateOut = 'animated fast rollOut';
  $('.col.s8.offset-s2').get(0)._uihooks = {
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
});

Template.signup.helpers({
  step() {
    const instance = Template.instance();
    return instance.state.get('step');
  },
  groups() {
    return Groups.find();
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
  }
});

Template.signup.events({
  'change input[type=url]'(event, instance) {
    instance.state.set('avatar', event.target.value);
  },
  'submit #step1 form'(event, instance) {
    event.preventDefault();
    
    const user = {
      email: event.target.email.value,
      password: event.target.password.value,
      profile: {
        fullName: event.target.fullName.value,
        avatar: event.target.avatar.value
      }
    };

    const token = instance.state.get('token');
    if (token) {
      Accounts.resetPassword(token, user.password, (err) => {
        if (err) {
          alert(err);
        } else {
          setFullName.call({ fullName: user.profile.fullName });
          instance.state.increment('step');
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
    // TODO: only for things in the list right now
    // wouldn't work for created or anything added to that list

    Groups.find().forEach((group) => {
      acceptInvite.call({
        groupId: group._id
      }, (err) => {
        if (err) {
          alert(err);
        }
      });
    });
    FlowRouter.go('/groups');
  }
});

