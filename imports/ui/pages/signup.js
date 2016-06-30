import './signup.html';

import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import { Accounts } from 'meteor/accounts-base';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Schema } from '../../api/schema.js';

Template.signup.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    step: 1
  });
  this.joining = new Mongo.Collection(null);
  this.joining.attachSchema(Schema.Group);
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
  joining() {
    const instance = Template.instance();
    return instance.joining.find();
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

    Accounts.createUser(user, (err) => {
      if (err) {
        alert(err);
      } else {
        instance.state.increment('step');
      }
    });
  },
  'submit #step2 form'(event, instance) {
    event.preventDefault();
    instance.state.decrement('step');
  }
});

