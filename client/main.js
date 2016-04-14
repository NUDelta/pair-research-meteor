import '/imports/startup/client';

if (Meteor.isDevelopment) {
  Affinities = require('../imports/api/affinities/affinities.js').Affinities;
  Groups = require('../imports/api/groups/groups.js').Groups;
  Pairings = require('../imports/api/pairings/pairings.js').Pairings;
  Tasks = require('../imports/api/tasks/tasks.js').Tasks;
}
