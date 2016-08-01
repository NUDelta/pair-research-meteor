import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import '../../ui/blaze-helpers.js';

import '../../ui/layout/layout.js';
import '../../ui/layout/layout-authorized.js';

import '../../ui/pages/home.js';
import '../../ui/pages/pair.js';
import '../../ui/pages/signup.js';
import '../../ui/pages/login.js';
import '../../ui/pages/user_settings.js';
import '../../ui/pages/groups_home.js';
import '../../ui/pages/groups_settings.js';
import '../../ui/pages/groups_create.js';
import '../../ui/pages/demo_pair.js';
import '../../ui/pages/under-construction.js';
import '../../ui/pages/forgot-password.js';
import '../../ui/pages/change-password.js';


FlowRouter.notFound = {
  action() {
    BlazeLayout.render('layout', { main: 'under_construction' });
  }
};

FlowRouter.route('/', {
  name: 'App.home',
  action() {
    // TODO: this isn't recommended
    if (Meteor.userId() || Meteor.loggingIn()) {
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
    if (Meteor.userId() || Meteor.loggingIn()) {
      FlowRouter.redirect('/');
    } else {
      BlazeLayout.render('login');
    }
  }
});

FlowRouter.route('/signup', {
  name: 'App.signup',
  action() {
    BlazeLayout.render('layout', { main: 'signup' });
  }
});

FlowRouter.route('/forgot-password', {
  name: 'App.forgotPassword',
  action() {
    BlazeLayout.render('forgot_password');
  }
});

FlowRouter.route('/change-password', {
  name: 'App.changePassword',
  triggersEnter: [
    (context, direct, stop) => {
      if (!context.queryParams.token) {
        BlazeLayout.render('layout', { main: 'under_construction' });
        stop();
      }
    }
  ],
  action() {
    BlazeLayout.render('change_password');
  }
});

FlowRouter.route('/user/settings', {
  name: 'App.user.settings',
  action() {
    BlazeLayout.render('layout_authorized', { main: 'user_settings' });
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
