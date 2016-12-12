import './demo_create.html';

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { createDemoGroup } from '../../api/groups/methods.js';

import '../components/loading.js';

Template.demo_create.onCreated(function() {
  createDemoGroup.call((err, groupId) => {
    if (err) {
      alert(err);
    } else {
      FlowRouter.go('/demo/:groupId', { groupId: groupId });
    }
  });
});
