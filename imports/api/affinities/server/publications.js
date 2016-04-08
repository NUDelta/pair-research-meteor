import { Meteor } from 'meteor/meteor';

import { Affinities } from '../affinities.js';

Meteor.publish('affinities', function() {
  if (this.userId) {
    this.ready();
  } else {
    return Affinities.find({ helperId: this.userId });
  }
});