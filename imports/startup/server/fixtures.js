import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import { Affinities } from '../../api/affinities/affinities.js';
import { Groups } from '../../api/groups/groups.js';
import { Pairings } from '../../api/pairings/pairings.js';
import { Tasks } from '../../api/tasks/tasks.js';
import { log } from './../../api/logs.js';
import '../../api/users/users.js';

import { addToGroup } from '../../api/groups/methods.js';

Meteor.startup(() => {

  if (!Meteor.isDevelopment) {
    return;
  }

  const admin = {
    username: 'kchen',
    password: 'password'
  };

  Meteor.users.remove({ username: { $ne: admin.username }});
  Groups.remove({});
  Tasks.remove({});
  Affinities.remove({});
  Pairings.remove({});

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
        username: 'haoqi',
        password: 'password'
      },
      {
        username: 'josh',
        password: 'password'
      },
      {
        username: 'yongsung',
        password: 'password'
      },
      {
        username: 'ryan',
        password: 'password'
      },
      {
        username: 'shannnon',
        password: 'password'
      },
      {
        username: 'sarah',
        password: 'password'
      }
    ];
    userData.forEach(user => Accounts.createUser(user));
    Meteor.users.find().forEach(user => addToGroup.call({ groupId: groupId, userId: user._id }));

    Tasks.update({ userId: adminId }, { $set: { task: 'everything' }});

    Tasks.update({ name: 'haoqi' }, { $set: { task: 'Help with Stella' }});
    Tasks.update({ name: 'josh' }, { $set: { task: 'Nothing' }});
    Tasks.update({ name: 'yongsung' }, { $set: { task: 'I am a very wordy person who needs help with a lot alot alot o things, so I will see how long this line can go without making the UI look awful' }});
    Tasks.update({ name: 'ryan' }, { $set: { task: 'I am a very wordy person who needs help with a lot alot alot o things, so I will see how long this line can go without making the UI look awful' }});
    Tasks.update({ name: 'shannon' }, { $set: { task: 'I am a very wordy person who needs help with a lot alot alot o things, so I will see how long this line can go without making the UI look awful' }});
    Tasks.update({ name: 'sarah' }, { $set: { task: 'I am a very wordy person who needs help with a lot alot alot o things, so I will see how long this line can go without making the UI look awful' }});

    const haoqiId = Meteor.users.findOne({ username: 'haoqi' })._id;
    const joshId = Meteor.users.findOne({ username: 'josh' })._id;

    const affinities = [
      {
        helperId: adminId,
        helpeeId: haoqiId,
        groupId: groupId,
        value: 4
      },
      {
        helperId: adminId,
        helpeeId: joshId,
        groupId: groupId,
        value: 5
      },
      {
        helperId: haoqiId,
        helpeeId: adminId,
        groupId: groupId,
        value: 4
      },
      {
        helperId: haoqiId,
        helpeeId: joshId,
        groupId: groupId,
        value: 2
      },
      {
        helperId: joshId,
        helpeeId: adminId,
        groupId: groupId,
        value: 5
      },
      {
        helperId: joshId,
        helpeeId: haoqiId,
        groupId: groupId,
        value: 2
      }
    ];

    affinities.forEach(affinity => Affinities.insert(affinity));
  }
});
