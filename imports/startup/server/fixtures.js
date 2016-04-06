import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Groups } from '../../api/groups/groups';
import { Memberships } from '../../api/memberships/memberships';
import '../../api/users/users';

Meteor.startup(() => {
  const userData = [
    {
      username: 'kchen',
      password: 'password'
    },
    {
      username: 'hzhang',
      password: 'password'
    },
    {
      username: 'josh',
      password: 'complexpassword'
    }
  ];

  if (Meteor.users.find().count() === 0) {
    userData.forEach(user => Accounts.createUser(user));
  }
});