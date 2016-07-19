import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { generateAvatar } from '../api/util.js';

Template.registerHelper('$id', a => a.replace(' ', '_'));

Template.registerHelper('$x', (a, b) => a * b);

Template.registerHelper('$and', (a, b) => a && b);

Template.registerHelper('$eq', (a, b) => a == b);

Template.registerHelper('$nt', a => !a);

Template.registerHelper('$gt', (a, b) => {
  return a > b;
});

Template.registerHelper('$if', (a, b) => {
  if (a) {
    return b;
  }
});

Template.registerHelper('$stringify', (obj) => {
  return JSON.stringify(obj);
});

Template.registerHelper('$len', arr => arr.length);

Template.registerHelper('$avatar', (userId, username) => {
  if (userId) {
    const user = Meteor.users.findOne(userId);
    if (user && user.profile.avatar) {
      return user.profile.avatar;
    }
  }
  return generateAvatar(username);
});

