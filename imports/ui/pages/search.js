import './search.html'

import { ReactiveDict } from 'meteor/reactive-dict';
import { getHelpers } from '../../api/search/methods.js'

Template.search.onCreated(function() {
    this.state = new ReactiveDict();
    this.state.setDefault({
      helpingUsers: [
          {name: "Bob",
            task: "Help me prototype my new interface"},
          {name: "Alice",
            task: "UI review for new app"},
          {name: "Carol",
            task: "Help me get started with Sketch"},
      ],
      response: null
    });

});

Template.search.helpers({
    helpingUsers() {
        const instance = Template.instance();
        return instance.state.get('helpingUsers');
    },
    pythonResponse() {
        const instance = Template.instance();
        return instance.state.get('response');
    }
});

Template.search.events({
    'click .phrase-search'(event, instance) {
        event.preventDefault();
        var curr_state = instance.state.get('response')
        console.log(curr_state)
    },
    'submit form'(event, instance) {
      event.preventDefault();

      var response = getHelpers.call({
          phrase: event.target.searchText.value
      }, (err, result) => {
          if (err) {
              console.log(err);
          } else {
              console.log(result);
              instance.state.set('response', result);
          }
      });
    }
})
