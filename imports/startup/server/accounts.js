import { Accounts } from 'meteor/accounts-base';

Accounts.onCreateUser((options, user) => {
  options.profile = options.profile || {};
  options.profile.groups = options.profile.groups || [];

  user.profile = options.profile;
  return user;
});

