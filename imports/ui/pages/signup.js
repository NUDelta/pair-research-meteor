import './signup.html';

import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

Template.signup.events({
  'submit form'(event, template) {
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
      }
    });
  }
});