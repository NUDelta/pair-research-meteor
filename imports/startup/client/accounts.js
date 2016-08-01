import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { findEmailFromToken } from '../../api/users/methods.js';

export let doneCallback;

Accounts.onEnrollmentLink((token, done) => {
  findEmailFromToken.call({
    token: token
  }, (err, email) => {
    if (err) {
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

