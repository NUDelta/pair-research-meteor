import './contact.html';

import { Template } from 'meteor/templating';

import { sendFeedback } from '../../api/users/methods.js';

Template.contact.events({
  'submit form'(event, instance) {
    event.preventDefault();
    const contact = event.target.email.value;
    const content = event.target.content.value;

    sendFeedback.call({ contact, content }, err => {
      if (err) {
        alert(err);
      } else {
        alert('Your feedback has been received.');
      }
    });
  }
});