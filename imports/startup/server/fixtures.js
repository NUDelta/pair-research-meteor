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
    Meteor.users.update(adminId, { $set: { groups: [] }});

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
        username: 'shannon',
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
    Tasks.update({ name: 'josh' }, { $set: { task: 'I need to learn how to feed the baby' }});
    Tasks.update({ name: 'yongsung' }, { $set: { task: 'I am a very wordy person who needs help with way too many things, so I will see how long this line can go without making the UI look awful' }});
    Tasks.update({ name: 'ryan' }, { $set: { task: 'Push notifications are broken again' }});
    Tasks.update({ name: 'shannon' }, { $set: { task: 'By the end with this sprint, I will have completed a very tangible goal.' }});
    Tasks.update({ name: 'sarah' }, { $set: { task: 'need 2 to get out of bed and am hungry' }});

    const haoqiId = Meteor.users.findOne({ username: 'haoqi' })._id;
    const joshId = Meteor.users.findOne({ username: 'josh' })._id;
    const ykId = Meteor.users.findOne({ username: 'yongsung' })._id;

    const affinities = [
      {
        helperId: adminId,
        helpeeId: haoqiId,
        groupId: groupId,
        value: 0.66
      },
      {
        helperId: adminId,
        helpeeId: joshId,
        groupId: groupId,
        value: 1
      },
      {
        helperId: haoqiId,
        helpeeId: adminId,
        groupId: groupId,
        value: 0.66
      },
      {
        helperId: haoqiId,
        helpeeId: joshId,
        groupId: groupId,
        value: 0
      },
      {
        helperId: joshId,
        helpeeId: adminId,
        groupId: groupId,
        value: 0.33
      },
      {
        helperId: joshId,
        helpeeId: haoqiId,
        groupId: groupId,
        value: 0
      },
      {
        helperId: adminId,
        helpeeId: ykId,
        groupId: groupId,
        value: -1
      }
    ];

    affinities.forEach(affinity => Affinities.insert(affinity));
  }
});
