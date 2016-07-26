import './home.html';

import { Template } from 'meteor/templating';

import { createDemoGroup } from '../../api/groups/methods.js';

Template.home.events({
  'click #demo-pool'(event, instance) {
    event.preventDefault();
    createDemoGroup.call((err, groupId) => {
      if (err) {
        alert(err);
      } else {
        FlowRouter.go('/demo/:groupId', { groupId: groupId });
      }
    });
  }
});
