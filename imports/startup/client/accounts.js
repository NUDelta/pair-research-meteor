import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { findEmailFromToken } from '../../api/users/methods.js';

Accounts.onEnrollmentLink((token, done) => {
  if (Meteor.userId()) {
    // TODO: handle this: e.g. force logout or ask if they want to merge accounts
    // FIXME: this doesn't fire at all right now
    alert('Please log out first!');
    done();
  } else {
    findEmailFromToken.call({
      token: token
    }, (err, email) => {
      if (err) {
        alert(err.message);
      } else {
        FlowRouter.go('/signup', {}, { token, email });
      }
    });
  }
});