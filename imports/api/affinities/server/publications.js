import { Meteor } from 'meteor/meteor';

import { Affinities } from '../affinities.js';

Meteor.publish('affinities.inGroup', function(groupId) {
  // TODO: this could probably be reworked
  // if (!this.userId) {
  //   this.ready();
  // } else {
  return Affinities.find({ groupId: groupId });
  // }
});