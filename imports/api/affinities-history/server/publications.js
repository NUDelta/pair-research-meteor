import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { AffinitiesHistory } from '../affinities-history.js';
import { Auth, authenticated } from '../../authentication.js';

Meteor.publish('affinitiesHistory.byGroup', function(groupId) {
  // TODO: admin only?
  if (authenticated(Auth.GroupMember, this.userId, groupId)) {
    return AffinitiesHistory.find({ groupId });
  } else {
    this.ready();
  }
});
