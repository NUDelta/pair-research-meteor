import { Template } from 'meteor/templating';

Template.registerHelper('$x', (a, b) => a * b);

Template.registerHelper('$and', (a, b) => a && b);

Template.registerHelper('$eq', (a, b) => a == b);

Template.registerHelper('$nt', a => !a);

Template.registerHelper('$gt', (a, b) => {
  return a > b;
});

Template.registerHelper('$stringify', (obj) => {
  return JSON.stringify(obj);
});
