import { Template } from 'meteor/templating';

Template.registerHelper('$gt', (a, b) => {
  return a > b;
});
