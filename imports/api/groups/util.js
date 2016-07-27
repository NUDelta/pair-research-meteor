import { _ } from 'meteor/stevezhu:lodash';

const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

/**
 * Process a comma-separated list of emails to, filtering out
 * duplicates and invalid email addresses into an array.
 *
 * @param emails
 * @param duplicateCheck
 * @param callback
 * @returns None
 */
export const processEmails = (emails, duplicateCheck, callback) => {
  const emailArray = _.compact(_.map(emails.split(','), email => email.replace(/ /g, '')));
  const invalid = _.filter(emailArray, email => !re.test(email));
  const valid = _.uniq(_.filter(emailArray, email => re.test(email)));

  if (invalid.length) {
    alert(`[${ invalid }] is/are not email addresses and will not be added.`);
  }
  let duplicates = [];
  valid.forEach((email) => {
    if (duplicateCheck(email)) {
      duplicates.push(email);
    } else {
      callback(email);
    }
  });
  if (duplicates.length) {
    alert(`[${ duplicates }] is/are duplicates and not added.`);
  }
};


