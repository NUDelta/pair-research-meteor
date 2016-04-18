import './create.html';

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { createRandomGroup } from '../../api/groups/methods.js';

Template.create.events({
  'click #create-pool'(event, instance) {
    createRandomGroup.call((err, groupId) => {
      if (err) {
        
      } else {
        FlowRouter.go('/pair/:groupId', { groupId: groupId });
      }
    });
  }
});