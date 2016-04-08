import { FlowRouter } from 'meteor/kadira:flow-router';

import '../../ui/layout/layout.js';
import '../../ui/layout/layout-authorized.js';

import '../../ui/pages/not-authorized.js';
import '../../ui/pages/pair.js';

FlowRouter.route('/', {
  name: 'App.home',
  action() {
    BlazeLayout.render('layout_authorized', { main: 'pair' });
  }
});