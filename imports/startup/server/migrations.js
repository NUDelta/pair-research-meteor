import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { Random } from 'meteor/random';
import { _ } from 'meteor/stevezhu:lodash';

import { EMAIL_ADDRESS } from '../../api/constants.js';
import { Groups } from '../../api/groups/groups.js';
import { Pairings } from '../../api/pairings/pairings.js';

Email.send({
  from: EMAIL_ADDRESS,
  to: 'kevinjchen94@gmail.com',
  subject: 'A new deployment has finished!',
  text: 'You should be receiving this in your mail client.'
});

// 7/28/2016 changing role infrastructure / admin privileges
//           archiving existing pairing info
const groupIds = Groups.find({}, { fields: { _id: 1 } }).fetch().map(group => group._id);
Pairings.remove({ groupId: { $nin: groupIds } });
Pairings.find().forEach(pairing => {
  Pairings.saveHistory(pairing._id, pairing);
});

Groups.find().forEach(group => {
  const roles = _.map(group.roles, role => {
    return {
      title: role.title,
      _id: Random.id()
    }
  });

  const memberIds = _.map(group.members, member => member.userId);
  let reconstructedMembers = [];

  Meteor.users.find({ _id: { $in: memberIds } }).forEach(user => {
    const userIndex = _.findIndex(user.groups, _group => _group.groupId == group._id);
    const groupIndex = _.findIndex(group.members, member => member.userId == user._id);
    const userMembership = user.groups[userIndex];
    const groupMembership = group.members[groupIndex];

    const oldRole = userMembership.role;
    if (oldRole.weight === 100) {
      userMembership.isAdmin = true;
      groupMembership.isAdmin = true;
    } else {
      userMembership.isAdmin = false;
      groupMembership.isAdmin = false;
    }
    if (oldRole.weight === 1) {
      userMembership.isPending = true;
      groupMembership.isPending = true;
    } else {
      userMembership.isPending = false;
      groupMembership.isPending = false;
    }

    const newRole = _.find(roles, role => oldRole.title == role.title);
    userMembership.role = newRole;
    groupMembership.role = newRole;

    Meteor.users.update(user._id, { $set: { groups: user.groups } });
    reconstructedMembers.push(groupMembership);
  });

  Groups.update(group._id, { $set: { members: reconstructedMembers, roles } });
});


// 7/11/2016 adding new group and role infrastructure

// Groups.remove({});
// Meteor.users.update({},
//   {
//     $set: {
//       groups: []
//     }
//   }
// );

// 6/03/2016 nuking group info

// Groups.remove({});
// Meteor.users.update({},
//   {
//     $set: {
//       groups: []
//     }
//   }
// );
