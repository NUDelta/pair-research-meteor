import { FlowRouter } from 'meteor/kadira:flow-router';

import '../../ui/layout/layout.js';
import '../../ui/layout/layout-authorized.js';

import '../../ui/pages/not-authorized.js';
import '../../ui/pages/pair.js';
import '../../ui/pages/create.js';

FlowRouter.route('/pair', {
  name: 'App.pair',
  action() {
    BlazeLayout.render('layout_authorized', { main: 'pair' });
  }
});

FlowRouter.route('/', {
  name: 'App.home',
  action() {
    BlazeLayout.render('layout_authorized', { main: 'create' });
  }
});
