import { _ } from 'meteor/stevezhu:lodash';

export const PotentialActions = [
  'Figure out how to do [web task] in [web framework]', // weighting it
  'Figure out how to do [web task] in [web framework]',
  'Figure out how to do [web task] in [web framework]',
  'Figure out how to do [web task] in [web framework]',
  '[web framework] [web task] is broken again',
  '[web framework] [web task] is broken again',
  'Reading the [web framework] tutorial',
  'Experiment with making a [web framework] app',
  'User test my [web framework] app',
  'Writing my paper for [conference]',
  'Proofread my paper for [conference]',
  'Reviewing my paper for [conference]',
];

export const WebFrameworks = [
  'Meteor',
  'NodeJS',
  'MongoDB',
  'iOS',
  'Android',
  'Google Glass',
  'AngularJS',
  'Ember',
  'React',
  'React Native',
  'Redux',
  'Foundation',
  'Bootstrap',
  'Three.js',
  'Moment',
  'Ionic',
  'Backbone',
  'jQuery',
  'Materialize',
  'lodash',
  'Webpack',
  'Gulp',
  'Grunt',
  'Phoenix',
  'Flask',
  'Django',
  'D3',
  'Chartjs'
];

export const WebTasks = [
  'multithreading',
  'parallelism',
  'polymorphism',
  'machine learning',
  'deep learning',
  'neural networks',
  'location tracking',
  'crowd sourcing',
  'file storage',
  'image upload',
  'data visualizations',
  'data analysis',
  'computer vision',
  'race condition prevention',
  'synchronous programming',
  'asynchronous programming'
];

export const Conferences = [
  'UIST',
  'CHI',
  'CSCW',
  'HCOMP'
];

/**
 * Generates a random task from the possibilities above.
 * @returns {string}
 */
export const getTask = () => {
  let action = _.sample(PotentialActions);
  action = _.replace(action, '[web framework]', _.sample(WebFrameworks));
  action = _.replace(action, '[web task]', _.sample(WebTasks));
  action = _.replace(action, '[conference]', _.sample(Conferences));
  return action;
};

