import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Pairings } from '../pairings.js';
import { Auth, authenticated } from '../../authentication.js';

Meteor.publish('pairings.forGroup', function(activePairing) {
  check(activePairing, Match.Where(a => SimpleSchema.RegEx.Id.test(activePairing)));
  if (activePairing) {
    return Pairings.find({ _id: activePairing });
  } else {
    this.ready();
  }
});

Meteor.publish('pairings.all.byGroup', function(groupId) {
  if (authenticated(Auth.GroupMember, this.userId, groupId)) {
    return Pairings.find({ groupId });
  } else {
    this.ready();
  }
});