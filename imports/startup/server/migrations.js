import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { Random } from 'meteor/random';
import { _ } from 'meteor/stevezhu:lodash';

import { log } from '../../api/logs.js';
import { EMAIL_ADDRESS } from '../../api/constants.js';
import { Groups } from '../../api/groups/groups.js';
import { Pairings } from '../../api/pairings/pairings.js';

Email.send({
  from: EMAIL_ADDRESS,
  to: 'kevinjchen94@gmail.com',
  subject: 'A new deployment has finished!',
  text: 'You should be receiving this in your mail client.'
});

// 8/1/2016 This was an incredibly messy migration. Needs a dry run int eh future
// 7/28/2016 changing role infrastructure / admin privileges
//           archiving existing pairing info

// const groupIds = Groups.find({}, { fields: { _id: 1 } }).fetch().map(group => group._id);
// Pairings.remove({ groupId: { $nin: groupIds } });
// Pairings.find().forEach(pairing => {
//   Pairings.saveHistory(pairing._id, pairing);
// });

// Groups.find().forEach(group => {
//   log.debug(`Starting migrations for ${ group.groupName }`);
//   const roles = _.map(group.roles, role => {
//     return {
//       title: role.title,
//       _id: Random.id()
//     }
//   });
//
//   const memberIds = _.map(group.members, member => member.userId);
//   let reconstructedMembers = [];
//
//   Meteor.users.find({ _id: { $in: memberIds } }).forEach(user => {
//     const groupIndex = _.findIndex(group.members, member => member.userId == user._id);
//     const groupMembership = group.members[groupIndex];
//
//     const oldRole = groupMembership.role;
//     if (oldRole.weight === 100) {
//       groupMembership.isAdmin = true;
//     } else {
//       groupMembership.isAdmin = false;
//     }
//     if (oldRole.weight === 1) {
//       groupMembership.isPending = true;
//     } else {
//       groupMembership.isPending = false;
//     }
//
//     const newRole = _.find(roles, role => oldRole.title == role.title);
//     groupMembership.role = newRole;
//
//     reconstructedMembers.push(groupMembership);
//   });
//
//   Groups.update(group._id, { $set: { members: reconstructedMembers, roles } });
//   log.debug(`Migrations completed for ${ group.groupName }`);
// });
//
// Meteor.users.find().forEach(user => {
//   const newGroups = _.map(user.groups, group => {
//     const groupDoc = Groups.findOne(group.groupId);
//     const membership = groupDoc.getMembership(user._id);
//     return {
//       groupId: group.groupId,
//       groupName: group.groupName,
//       role: membership.role,
//       isAdmin: membership.isAdmin,
//       isPending: membership.isPending
//     }
//   });
//   Meteor.users.update(user._id, { $set: { groups: newGroups } });
// });

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
