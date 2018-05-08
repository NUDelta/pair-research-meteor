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

Accounts.emailTemplates.enrollAccount.html = (user, url) => {
  const invitedGroup = user.groups[0];
  var dataContext = {
    path: url,
    group: invitedGroup.groupName
  };

  SSR.compileTemplate('htmlEmail', Assets.getText('html/email-invite.html'));
  console.log(Assets.absoluteFilePath('img/delta.jpg'));
  Template.htmlEmail.helpers({
    delta: Assets.absoluteFilePath('img/delta.jpg'),
    call_merge: Assets.absoluteFilePath('img/call_merge.png'),
    flash_on: Assets.absoluteFilePath('img/flash_on.png'),
    people: Assets.absoluteFilePath('img/people.png')
  });

  return SSR.render('htmlEmail', dataContext);
//   return `To join this pair research pool, just click the link below:

// ${ url }

// If you've received multiple invitation emails, please be sure to click the link for the most recent one.`;
};

Accounts.emailTemplates.resetPassword.subject = (user) => {
  return `Resetting your Pair Research password`;
};

Accounts.emailTemplates.resetPassword.text = (user, url) => {
  return `To proceed with resetting your password, click the link below:

${ url }

If you did not request a password reset you can safely ignore this email.`;
};
