import { FlowRouter } from 'meteor/kadira:flow-router';

import '../../ui/blaze-helpers.js';

import '../../ui/layout/layout.js';
import '../../ui/layout/layout-authorized.js';

import '../../ui/pages/pair.js';
import '../../ui/pages/create.js';
import '../../ui/pages/groups_home.js';
import '../../ui/pages/groups_settings.js';

FlowRouter.route('/', {
  name: 'App.home',
  action() {
    BlazeLayout.render('layout_authorized', { main: 'create' });
  }
});

FlowRouter.route('/pair/:groupId', {
  name: 'App.pair',
  action() {
    BlazeLayout.render('layout_authorized', { main: 'pair' });
  }
});

FlowRouter.route('/groups', {
  name: 'App.groups.home',
  action() {
    BlazeLayout.render('layout_authorized', { main: 'groups_home' });
  }
});

FlowRouter.route('/groups/:groupId', {
  name: 'App.groups.group',
  action() {
    BlazeLayout.render('layout_authorized', { main: 'groups_settings' });
  }
});
