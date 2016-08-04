import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { PairsHistory } from '../pairs-history.js';
import { Auth, authenticate } from '../../authentication.js';

Meteor.publish('pairsHistory.byGroup', function(groupId) {
  authenticate(Auth.GroupMember, this.userId, groupId);
  // TODO: verify admin privileges
  return PairsHistory.find({ groupId });
});