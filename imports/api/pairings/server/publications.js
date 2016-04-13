import { Meteor } from 'meteor/meteor';
import { Pairings } from '../pairings.js';

Meteor.publish('pairings.forGroup', function(activePairing) {
  if (activePairing) {
    return Pairings.find({ _id: activePairing });
  } else {
    this.ready();
  }
});