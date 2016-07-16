import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Pairings } from '../pairings.js';

Meteor.publish('pairings.forGroup', function(activePairing) {
  if (activePairing) {
    return Pairings.find({ _id: activePairing });
  } else {
    this.ready();
  }
});

Meteor.publish('pairings.all.byGroup', function(groupId) {
  check(groupId, Match.Where(a => SimpleSchema.RegEx.Id.test(groupId)));
  if (!this.userId) {
    this.ready();
  } else {
    return Pairings.find({ groupId });
  }
});