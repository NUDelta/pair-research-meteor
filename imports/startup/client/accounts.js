import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { findEmailFromToken } from '../../api/users/methods.js';

export let doneCallback;

// https://docs.meteor.com/api/passwords.html#Accounts-onEnrollmentLink
Accounts.onEnrollmentLink((token, done) => {
  console.log(token, done);

  // TODO: the token should be a password reset token
  findEmailFromToken.call({
    token: token
  }, (err, email) => {
    if (err) {
      console.error(err);
      alert(err.message);
    } else {
      doneCallback = done;
      FlowRouter.go('/signup', {}, { token, email });
    }
  });
});

Accounts.onResetPasswordLink((token, done) => {
  doneCallback = done;
  FlowRouter.go('/change-password', {}, { token });
});

