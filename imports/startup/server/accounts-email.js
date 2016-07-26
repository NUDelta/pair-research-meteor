import { Accounts } from 'meteor/accounts-base';

import { Groups } from '../../api/groups/groups.js';
import {
  SITE_NAME,
  EMAIL_ADDRESS
} from '../../api/constants.js';

Accounts.emailTemplates.siteName = SITE_NAME;
Accounts.emailTemplates.from = EMAIL_ADDRESS;

Accounts.emailTemplates.enrollAccount.subject = (user) => {
  const invitedGroup = Groups.findOne(user.groups[0].groupId);
  return `You're invited to join ${ invitedGroup.groupName } for Pair Research`;
};
Accounts.emailTemplates.enrollAccount.text = (user, url) => {
  return `To join this pair research pool, just click the link below:\n\n${ url }`;
};



