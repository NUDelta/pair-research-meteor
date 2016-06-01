import { Template } from 'meteor/templating';

Template.registerHelper('$nt', a => !a);

Template.registerHelper('$gt', (a, b) => {
  return a > b;
});

Template.registerHelper('$stringify', (obj) => {
  return JSON.stringify(obj);
});
