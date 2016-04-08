import { FlowRouter } from 'meteor/kadira:flow-router';

import '../../ui/layout/app-body.js';

import '../../ui/pages/pair.js';

FlowRouter.route('/', {
  name: 'App.home',
  action() {
    BlazeLayout.render('App_body', { main: 'Pair' });
  }
});