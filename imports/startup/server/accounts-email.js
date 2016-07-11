import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

import { Groups } from '../../api/groups/groups.js';

Accounts.emailTemplates.siteName = 'Pair Research';
Accounts.emailTemplates.from = 'Pair Research <no-reply@pair.meteorapp.com';

Accounts.emailTemplates.enrollAccount.subject = (user) => {
  const invitedGroup = Groups.findOne(user.groups[0].groupId);
  return `You're invited to join ${ invitedGroup.groupName } for Pair Research`;
};
Accounts.emailTemplates.enrollAccount.text = (user, url) => {
  return `To join this pair research pool, just click the link below:\n\n${ url }`;
};
