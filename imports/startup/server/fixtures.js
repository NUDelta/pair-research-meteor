import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import { Affinities } from '../../api/affinities/affinities.js';
import { Groups } from '../../api/groups/groups.js';
import { Pairings } from '../../api/pairings/pairings.js';
import { Tasks } from '../../api/tasks/tasks.js';

import { log } from './../../api/logs.js';
import { DEV_OPTIONS } from '../config.js';

import { createGroup, addToGroup } from '../../api/groups/methods.js';

Meteor.startup(() => {
  const admin = {
    email: 'kc@kc.com',
    password: 'password',
    profile: {
      fullName: 'Kevin Chen',
      screenName: 'kchen'
    }
  };
  
  admin._id = Accounts.findUserByEmail(admin.email);
  if (Meteor.isDevelopment && DEV_OPTIONS.CLEAN_DB) {
    log.info(`Clearing database...`);
    Meteor.users.remove({ _id: { $ne: admin._id }});
    Groups.remove({});
    Tasks.remove({});
    Affinities.remove({});
    Pairings.remove({});
  }

  if (Meteor.users.find().count() === 0) {
    admin._id = Accounts.createUser(admin);
  }

  if (Meteor.users.find().count() === 1) {
    log.info('No data currently in database. Populating...');

    // Mock DTR group pairing pool
    Meteor.users.update(admin._id, { $set: { groups: [] }});

    const groupId = createGroup.call({
      groupName: 'dtr',
      description: 'Northwestern Design, Technology, and Research class geared toward undergrads working on research. Visit us at http://dtr.northwestern.edu/',
      creatorId: admin._id,
      publicJoin: false,
      allowGuests: true
    });
    Tasks.update({ userId: admin._id }, { $set: { task: 'everything '} });

    const userData = [
      {
        email: 'hq@northwestern.edu',
        password: 'password',
        profile: {
          fullName: 'Haoqi Zhang'
        },
        task: 'help with Stella'
      },
      {
        email: 'jh@u.northwestern.edu',
        password: 'password',
        profile: {
          fullName: 'Josh Hibschmann'
        },
        task: 'I need to learn how to feed the baby'
      },
      {
        email: 'yk@u.northwestern.edu',
        password: 'password',
        profile: {
          fullName: 'Yongsung Kim'
        },
        task: 'I am a very wordy person who needs help with way too many things, so I will see how long this line can go without making the UI look awful'
      },
      {
        email: 'ryanmadden2017@u.northwestern.edu',
        password: 'password',
        profile: {
          fullName: 'Ryan Madden'
        },
        task: 'Push notifications are broken again'
        
      },
      {
        email: 'shannonnachreiner2012@u.northwestern.edu',
        password: 'password',
        profile: {
          fullName: 'Shannon Nachreiner'
        },
        task: 'By the end with this sprint, I will have completed a very tangible goal.'
      },
      {
        email: 'sarah@sarahlim.com',
        password: 'password',
        profile: {
          fullName: 'Sarah Lim'
        },
        task: 'need 2 to get out of bed and am hungry'
      }
    ];
    userData.forEach((user) => {
      const userId = Accounts.createUser(user);
      addToGroup.call({ groupId: groupId, userId: userId });
      Tasks.update({ userId: userId }, { $set: { task: user.task }});
    });

    const haoqiId = Accounts.findUserByEmail('hq@northwestern.edu')._id;
    const joshId = Accounts.findUserByEmail('jh@u.northwestern.edu')._id;
    const ykId = Accounts.findUserByEmail('yk@u.northwestern.edu')._id;

    const affinities = [
      {
        helperId: admin._id,
        helpeeId: haoqiId,
        groupId: groupId,
        value: 0.66
      },
      {
        helperId: admin._id,
        helpeeId: joshId,
        groupId: groupId,
        value: 1
      },
      {
        helperId: haoqiId,
        helpeeId: admin._id,
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
        helpeeId: admin._id,
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
        helperId: admin._id,
        helpeeId: ykId,
        groupId: groupId,
        value: -1
      }
    ];
    affinities.forEach(affinity => Affinities.insert(affinity));

    // Mocking other groups / users
    const miscUsers = [
      {
        email: 'outsider@mit.edu',
        password: 'password',
        profile: {
          fullName: 'Outsider Man'
        }
      },
      {
        email: 'noaccess@mit.edu',
        password: 'password',
        profile: {
          fullName: 'NoAccess Girl'
        }
      }
    ];
    const otherUserId = Accounts.createUser(miscUsers[0]);
    const otherGroupId = createGroup.call({
      groupName: 'otherGroup',
      description: 'This is a regular group in which Kevin is a regular user.',
      creatorId: otherUserId,
      publicJoin: false,
      allowGuests: false
    });
    addToGroup.call({ groupId: otherGroupId, userId: admin._id });
    
    const noAccessGroup = createGroup.call({
      groupName: 'noAccessGroup',
      description: 'This is a private group that Kevin does not have access to.',
      creatorId: otherUserId,
      publicJoin: false,
      allowGuests: false
    });
    Accounts.createUser(miscUsers[1]);
  }
});
