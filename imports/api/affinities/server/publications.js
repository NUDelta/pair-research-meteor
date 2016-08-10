import { Meteor } from 'meteor/meteor';

import { Affinities } from '../affinities.js';
import { Auth, authenticated } from '../../authentication.js';

Meteor.publish('affinities.inGroup', function(groupId) {
  if (authenticated(Auth.GroupMember, this.userId, groupId)) {
    return Affinities.find({ groupId: groupId });
  } else {
    this.ready();
  }
});