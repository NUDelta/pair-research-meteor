import { FlowRouter } from 'meteor/kadira:flow-router';

// Import layout
import '../../ui/layout/app-body';

// Import pages
import '../../ui/pages/pair';

FlowRouter.route('/', {
  name: 'App.home',
  action() {
    BlazeLayout.render('App_body', { main: 'Pair' });
  }
});