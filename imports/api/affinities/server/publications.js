import { Meteor } from 'meteor/meteor';

import { Affinities } from '../affinities.js';
import { Auth, authenticate } from '../../authentication.js';

Meteor.publish('affinities.inGroup', function(groupId) {
  authenticate(Auth.GroupMember, this.userId, groupId);
  return Affinities.find({ groupId: groupId });
});