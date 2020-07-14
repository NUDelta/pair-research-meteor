import { Accounts } from 'meteor/accounts-base';

import {
  SITE_NAME,
  EMAIL_ADDRESS
} from '../../api/constants.js';
import { EmailGenerator } from "../../api/email-generator.js";

Accounts.emailTemplates.siteName = SITE_NAME;
Accounts.emailTemplates.from = EMAIL_ADDRESS;


Accounts.emailTemplates.enrollAccount = {
  subject(user) {
    const invitedGroup = user.groups[0];
    return `You're invited to join ${ invitedGroup.groupName } for Pair Research`;
  },
  text(user, url) {
    const targetUserName = user.profile.fullName;
    const groupName = user.groups[0].groupName;

    return `Hey ${ targetUserName }! You have been invited to join the ${ groupName } Pair Research group! Click the link below to join this group:
    ${ url }
    If you've received multiple invitation emails, please be sure to click the link for the most recent one.`;
  },
  html(user, url) {
    let emailData = {
      name: user.profile.fullName,
      group: user.groups[0].groupName,
      joinLink: url
    };

    return EmailGenerator.generateHtml("newAccount", emailData);
  }
};

Accounts.emailTemplates.resetPassword = {
  subject(user) {
    return `Resetting your Pair Research password`;
  },
  text(user, url) {
    return `To proceed with resetting your password, click the link below:
    ${ url }
    If you did not request a password reset you can safely ignore this email.`;
  },
  html(user, url) {
    let emailData = {
      name: user.profile.fullName,
      resetPwdLink: url
    };

    return EmailGenerator.generateHtml("resetPassword", emailData);
  }
};