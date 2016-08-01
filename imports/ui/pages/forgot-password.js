import './forgot-password.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

Template.forgot_password.events({
  'submit form'(event, instance) {
    event.preventDefault();
    const email = event.target.email.value;

    Accounts.forgotPassword({ email }, (err) => {
      if (err) {
        alert(err);
      } else {
        // TODO: redirect to a nice page
        alert('Email sent.');
      }
    });
  }
});
