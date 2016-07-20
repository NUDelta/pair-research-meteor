import '/imports/startup/client';

if (Meteor.isDevelopment) {
  Affinities = require('../imports/api/affinities/affinities.js').Affinities;
  AffinitiesHistory = require('../imports/api/affinities-history/affinities-history.js').AffinitiesHistory;
  Groups = require('../imports/api/groups/groups.js').Groups;
  Pairings = require('../imports/api/pairings/pairings.js').Pairings;
  PairsHistory = require('../imports/api/pairs-history/pairs-history.js').PairsHistory;
  Tasks = require('../imports/api/tasks/tasks.js').Tasks;
  TasksHistory = require('../imports/api/tasks-history/tasks-history.js').TasksHistory;
}
