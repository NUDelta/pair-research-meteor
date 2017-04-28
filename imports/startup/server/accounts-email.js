import { Accounts } from 'meteor/accounts-base';
import { SSR } from 'meteor/meteorhacks:ssr';

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

Accounts.emailTemplates.enrollAccount.html = (user, url) => {
	SSR.compileTemplate('invite_email', Assets.getText('invite_email.html'));
  return SSR.render('invite_email', {url: url});
};

Accounts.emailTemplates.resetPassword.subject = (user) => {
  return `Resetting your Pair Research password`;
};

Accounts.emailTemplates.resetPassword.text = (user, url) => {
  return `To proceed with resetting your password, click the link below:

${ url }

If you did not request a password reset you can safely ignore this email.`;
};
