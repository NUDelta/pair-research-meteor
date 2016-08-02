import './layout-unauthorized-only.html';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

Template.layout_unauthorized_only.onCreated(function() {
  this.autorun(() => {
    if (Meteor.user()) {
      FlowRouter.redirect('/groups');
    }
  });
});