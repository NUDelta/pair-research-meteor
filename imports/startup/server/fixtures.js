import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import { Affinities } from '../../api/affinities/affinities.js';
import { Groups } from '../../api/groups/groups';
import { Tasks } from '../../api/tasks/tasks.js';
import '../../api/users/users';
import { log } from './../../api/logs.js';

import { addToGroup } from '../../api/groups/methods.js';

Meteor.startup(() => {

  const admin = {
    username: 'kchen',
    password: 'password'
  };

  Meteor.users.remove({ username: { $ne: admin.username }});
  Groups.remove({});
  Tasks.remove({});
  Affinities.remove({});


  if (Meteor.users.find().count() === 0) {
    Accounts.createUser(admin);
  }

  if (Meteor.users.find().count() === 1) {
    log.info('No data currently in database. Populating...');

    const adminId = Meteor.users.findOne({ username: admin.username })._id;
    Meteor.users.update(adminId, { $set: { 'profile.groups': [] }});

    const groupId = Groups.insert({
      groupName: 'dtr',
      creatorId: adminId
    });

    const userData = [
      {
        username: 'hzhang',
        password: 'password'
      },
      {
        username: 'josh',
        password: 'complexpassword'
      }
    ];
    userData.forEach(user => Accounts.createUser(user));
    Meteor.users.find().forEach(user => addToGroup.call({ groupId: groupId, userId: user._id }));

    Tasks.update({ name: 'hzhang' }, { $set: { task: 'Help with Stella' }});

    Affinities.insert({
      helperId: adminId,
      helpeeId: Meteor.users.findOne({ username: 'hzhang' })._id,
      groupId: groupId,
      value: 4
    });
  }
});
