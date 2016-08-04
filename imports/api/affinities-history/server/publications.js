import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { AffinitiesHistory } from '../affinities-history.js';
import { Auth, authenticate } from '../../authentication.js';

Meteor.publish('affinitiesHistory.byGroup', function(groupId) {
  authenticate(Auth.GroupMember, this.userId, groupId); // TODO: admin only?
  // TODO: verify admin privileges
  return AffinitiesHistory.find({ groupId });
});
