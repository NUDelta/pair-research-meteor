import { FlowRouter } from 'meteor/kadira:flow-router';

import '../../ui/blaze-helpers.js';

import '../../ui/layout/layout.js';
import '../../ui/layout/layout-authorized.js';

import '../../ui/pages/home.js';
import '../../ui/pages/pair.js';
import '../../ui/pages/signup.js';
import '../../ui/pages/login.js';
import '../../ui/pages/groups_home.js';
import '../../ui/pages/groups_settings.js';
import '../../ui/pages/groups_create.js';
import '../../ui/pages/demo_pair.js';

FlowRouter.route('/', {
  name: 'App.home',
  action() {
    if (Meteor.userId()) {
      // TODO: or render?
      FlowRouter.redirect('/groups');
    } else {
      BlazeLayout.render('home');
    }
  }
});

FlowRouter.route('/pair/:groupId', {
  name: 'App.pair',
  action() {
    BlazeLayout.render('layout_authorized', { main: 'pair' });
  }
});

FlowRouter.route('/login', {
  name: 'App.login',
  action() {
    BlazeLayout.render('login');
  }
});

FlowRouter.route('/signup', {
  name: 'App.signup',
  action() {
    BlazeLayout.render('layout', { main: 'signup' });
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

FlowRouter.route('/create', {
  name: 'App.groups.create',
  action() {
    BlazeLayout.render('layout_authorized', { main: 'groups_create' });
  }
});

FlowRouter.route('/demo', {
  name: 'App.demo',
  action() {
    BlazeLayout.render('layout', { main: 'demo_create' });
  }
});

FlowRouter.route('/demo/:groupId', {
  name: 'App.demo.pair',
  action() {
    BlazeLayout.render('layout', { main: 'demo_pair' });
  }
});
