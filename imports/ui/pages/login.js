import './login.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.login.events({
  'submit form'(event, instance) {
    event.preventDefault();

    const email = event.target.email.value;
    const password = event.target.password.value;
    Meteor.loginWithPassword(email, password, (err) => {
      if (err) {
        alert(err);
      } else {
        FlowRouter.go('/groups');
      }
    })
  }
});