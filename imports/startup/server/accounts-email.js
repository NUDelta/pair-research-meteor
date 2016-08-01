import { Accounts } from 'meteor/accounts-base';

import {
  SITE_NAME,
  EMAIL_ADDRESS
} from '../../api/constants.js';

Accounts.emailTemplates.siteName = SITE_NAME;
Accounts.emailTemplates.from = EMAIL_ADDRESS;

Accounts.emailTemplates.enrollAccount.subject = (user) => {
  const invitedGroup = user.groups[0];
  return `You're invited to join ${ invitedGroup.groupName } for Pair Research`;
};

Accounts.emailTemplates.enrollAccount.text = (user, url) => {
  return `To join this pair research pool, just click the link below:\n\n${ url }`;
};

Accounts.emailTemplates.resetPassword.subject = (user) => {
  return `Resetting your Pair Research password`;
};

Accounts.emailTemplates.resetPassword.text = (user, url) => {
  return `To proceed with resetting your password, click the link below:

${ url }

If you did not request a password reset you can safely ignore this email.`;
};
