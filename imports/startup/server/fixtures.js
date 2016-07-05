import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import { Affinities } from '../../api/affinities/affinities.js';
import { Groups } from '../../api/groups/groups.js';
import { Pairings } from '../../api/pairings/pairings.js';
import { Tasks } from '../../api/tasks/tasks.js';

import { log } from './../../api/logs.js';
import { DEV_OPTIONS } from '../config.js';

import {
  createGroup,
  addToGroup,
  inviteToGroup,
} from '../../api/groups/methods.js';

Meteor.startup(() => {
  const admin = {
    username: 'kc',
    email: 'kc@kc.com',
    password: 'password',
    profile: {
      fullName: 'Kevin Chen',
      screenName: 'kchen',
      avatar: 'http://delta.northwestern.edu/wordpress/wp-content/uploads/2015/02/kevin1-square.jpg'
    }
  };
  
  admin._id = Accounts.findUserByEmail(admin.email) && Accounts.findUserByEmail(admin.email)._id;
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
          fullName: 'Haoqi Zhang',
          avatar: 'http://delta.northwestern.edu/wordpress/wp-content/uploads/2013/11/haoqi-250x250.jpg'
        },
        task: 'help with Stella'
      },
      {
        email: 'jh@u.northwestern.edu',
        password: 'password',
        profile: {
          fullName: 'Josh Hibschmann',
          avatar: 'http://delta.northwestern.edu/wordpress/wp-content/uploads/2014/09/josh.png'
        },
        task: 'I need to learn how to feed the baby'
      },
      {
        email: 'yk@u.northwestern.edu',
        password: 'password',
        profile: {
          fullName: 'Yongsung Kim',
          avatar: 'http://delta.northwestern.edu/wordpress/wp-content/uploads/2014/09/yongsung.jpg'
        },
        task: 'I am a very wordy person who needs help with way too many things, so I will see how long this line can go without making the UI look awful'
      },
      {
        email: 'ryanmadden2017@u.northwestern.edu',
        password: 'password',
        profile: {
          fullName: 'Ryan Madden',
          avatar: 'https://dl.dropboxusercontent.com/s/axu36bro60lzno2/7409814.jpeg'
        },
        task: 'Push notifications are broken again'
        
      },
      {
        email: 'shannonnachreiner2012@u.northwestern.edu',
        password: 'password',
        profile: {
          fullName: 'Shannon Nachreiner',
          avatar: 'https://dl.dropboxusercontent.com/s/77bhlenils7y1hc/aBJUQXT.jpg'
        },
        task: 'By the end with this sprint, I will have completed a very tangible goal.'
      },
      {
        email: 'sarah@sarahlim.com',
        password: 'password',
        profile: {
          fullName: 'Sarah Lim',
          avatar: 'https://dl.dropbox.com/s/gosrrsatr3m7iql/File%20Nov%2023%2C%204%2034%2032%20PM.jpeg'
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

    const invitedGroup = createGroup.call({
      groupName: 'invitedGroup',
      description: 'Kevin just got an invite to this group',
      creatorId: otherUserId,
      publicJoin: false,
      allowGuests: false
    });
    const invitees = [
      {
        email: 'kc@kc.com',
        role: {
          title: 'Pending',
          weight: 1
        }
      },
      {
        email: 'newguy@gmail.com',
        role: {
          title: 'Pending',
          weight: 1
        }
      }
    ];
    invitees.forEach(member => inviteToGroup.call({ groupId: invitedGroup, member: member }));
  }
});
