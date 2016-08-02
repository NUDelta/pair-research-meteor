import './change-password.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { doneCallback } from '../../startup/client/accounts.js';

Template.change_password.events({
  'change #confirm'(event, instance) {
    // TODO: see user_settings.js:59
    event.currentTarget.setCustomValidity('');
  },
  'submit form'(event, instance) {
    event.preventDefault();
    event.target.change.disabled = true;

    const token = FlowRouter.getQueryParam('token');
    const newPassword = event.target.password.value;
    const confirmPassword = event.target.confirm.value;

    if (!token) {
      alert('Your token is missing or has expired. Please follow the link in the email we sent you.');
    } else {
      if (newPassword != confirmPassword) {
        event.target.confirm.setCustomValidity('Passwords must match.');
        event.target.change.disabled = false;
      } else {
        Accounts.resetPassword(token, newPassword, (err) => {
          if (err) {
            alert(err);
          } else {
            alert('Your password has successfully been changed. Redirecting...');
            if (doneCallback) {
              doneCallback();
            }
            FlowRouter.go('/');
          }
          event.target.change.disabled = false;
        });
      }
    }
  }
});
