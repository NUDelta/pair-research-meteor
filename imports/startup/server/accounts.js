import { Accounts } from 'meteor/accounts-base';

Accounts.onCreateUser((options, user) => {
  options.profile = options.profile || {};

  user.profile = options.profile;
  user.groups = [];
  return user;
});

