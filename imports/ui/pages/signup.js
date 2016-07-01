import './signup.html';

import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Groups } from '../../api/groups/groups.js';
import { setFullName } from '../../api/users/methods.js';
import { Schema } from '../../api/schema.js';

Template.signup.onCreated(function() {
  this.subscribe('groups.user');

  this.state = new ReactiveDict();
  this.state.setDefault({
    step: 1,
    email: FlowRouter.getQueryParam('email'),
    token: FlowRouter.getQueryParam('token')
  });
});

Template.signup.onRendered(function() {
  // TODO: make animations better! they suck
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
  }
});

Template.signup.events({
  'submit #step1 form'(event, instance) {
    event.preventDefault();
    
    const user = {
      email: event.target.email.value,
      password: event.target.password.value,
      profile: {
        fullName: event.target.fullName.value
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
    FlowRouter.go('/groups');
  }
});

