import './pairings_results.html';

import { Template } from 'meteor/templating';

import { Pairings } from '../../api/pairings/pairings.js';

Template.pairings_results.onCreated(function() {
  this.autorun(() => {
    const data = Template.currentData();
    this.subscribe('pairings.forGroup', data.group.activePairing);
  });
});

Template.pairings_results.helpers({
  pairings() {
    const pairing = Pairings.findOne();
    return pairing && pairing.pairings;
  }
});
