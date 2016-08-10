import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { PairsHistory } from '../pairs-history.js';
import { Auth, authenticated } from '../../authentication.js';

Meteor.publish('pairsHistory.byGroup', function(groupId) {
  // TODO: admin only?
  if (authenticated(Auth.GroupMember, this.userId, groupId)) {
    return PairsHistory.find({ groupId });
  } else {
    this.ready();
  }

});