import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Email } from 'meteor/email';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'lodash';

import { Groups } from '../groups/groups.js';
import { Auth, AuthMixin } from '../authentication.js';
import { EMAIL_ADDRESS, CONTACT_EMAILS } from '../constants.js';

/**
 * @summary Finds users email from Account enrollment email token.
 * @isMethod true
 */
export const findEmailFromToken = new ValidatedMethod({
  name: 'users.find.email.token',
  validate: new SimpleSchema({
    token: {
      type: String
    }
  }).validator(),
  run({ token }) {
    console.log(token);

    if (!this.isSimulation) {
      // TODO: user is undefined
      const user = Meteor.users.findOne({ 'services.password.reset.token': token });

      /*
        { "address" : "kapil1garg@gmail.com", "verified" : false } ], "profile" : { "fullName" : "kapil1garg@gmail.com" }, "groups" : [ { "groupId" : "jpb4azzbYTPM2Lwuv", "role" : { "_id" : "55555555555555555", "title" : "Pending" }, "groupName" : "Design, Technology, and Research", "isAdmin" : false, "isPending" : true } ] }

        { "_id" : "YmLkzzvnrgBscMtue", "createdAt" : ISODate("2022-02-25T03:47:44.144Z"), "services" : { "password" : { "bcrypt" : "$2b$10$vuWrXyky1Aw.GBL79U3sN.RUmIwhaOKzGNBZ/L4NdgZq4xBU8axT." }, "resume" : { "loginTokens" : [ { "when" : ISODate("2022-06-16T18:33:28.099Z"), "hashedToken" : "WJnDrT8hSsPDe25L+mxEm27yfPo5XK+9hLnf94GzKdM=" }, { "when" : ISODate("2022-10-13T19:53:40.895Z"), "hashedToken" : "wxw97Mhvjy8xaPq8arBYHgzmTqqkSQ9UPSQ6eJIOvQE=" } ] } }, "username" : "kc", "emails" : [ { "address" : "kc@kc.com", "verified" : false } ], "profile" : { "fullName" : "Kevin Chen", "screenName" : "kchen", "avatar" : "http://delta.northwestern.edu/wordpress/wp-content/uploads/2015/02/kevin1-square.jpg" }, "groups" : [ { "groupId" : "jpb4azzbYTPM2Lwuv", "role" : { "title" : "Professor", "_id" : "8WQss7oDbXnp8qaSZ" }, "groupName" : "Design, Technology, and Research", "isAdmin" : true, "isPending" : false }, { "groupId" : "hqyJ93E75TiBbrmgv", "role" : { "title" : "Undergraduate Student", "_id" : "6jahtkTfEZrpeGB63" }, "groupName" : "Other Group Name", "isAdmin" : false, "isPending" : false }, { "groupId" : "9Qswd3xXHG2BFBGuo", "role" : { "_id" : "55555555555555555", "title" : "Pending" }, "groupName" : "invitedGroup", "isAdmin" : true, "isPending" : true } ] }
       */

      // Case 1: user is not in database, so should create new user and then invite
      // Case 2: user in database, should just login and be in group
      console.log(user);
      if (user) {
        return user.services.password.reset.email;
      } else {
        throw new Meteor.Error('invalid-token', 'The token provided does not match any known users.', JSON.stringify(token));
      }
    }
  }
});

/**
 * @summary Sets user profile info.
 * @isMethod true
 */
export const setProfile = new ValidatedMethod({
  name: 'users.update.name',
  validate: new SimpleSchema({
    profile: {
      type: Object
    },
    'profile.fullName': {
      type: String,
      optional: true
    },
    'profile.avatar': {
      type: String,
      optional: true
    }
  }).validator(),
  mixins: [AuthMixin],
  allow: [Auth.LoggedIn],
  run({ profile }) {
    if (profile.avatar && profile.avatar !== '' && !SimpleSchema.RegEx.Url.test(profile.avatar)) {
      throw new Meteor.Error('Avatar link must be a valid url.');
    }

    const user =  Meteor.users.findOne(this.userId);
    const groupIds = _.map(user.groups, group => group.groupId);
    Groups.find({
      _id: {
        $in: groupIds
      }
    }).forEach((group) => {
      const index = group.getMembershipIndex(this.userId);
      group.members[index].fullName = profile.fullName;
      Groups.update(group._id, { $set: { members: group.members } });
    });
    return Meteor.users.update(this.userId, { $set: { profile } });
  }
});

/**
 * @summary Sends and email to Haoqi and current maintainer (Kapil currently).
 * @isMethod true
 */
export const sendFeedback = new ValidatedMethod({
  name: 'users.sendemail',
  validate: new SimpleSchema({
    contact: {
      type: String,
      regEx: SimpleSchema.RegEx.Email
    },
    content: {
      type: String
    }
  }).validator(),
  run({ contact, content }) {
    const user = Meteor.users.findOne(this.userId);
    if (!this.isSimulation) {
      Email.send({
        from: EMAIL_ADDRESS,
        to: CONTACT_EMAILS,
        subject: `Feedback from ${ contact }`,
        text: `
${ contact } says:

${ content }

User metadata: ${ JSON.stringify(user) }
`
      });
    }
  }
});
