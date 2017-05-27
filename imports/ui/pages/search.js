import './search.html'

import { ReactiveDict } from 'meteor/reactive-dict';

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
    });

});

Template.search.helpers({
    helpingUsers() {
        const instance = Template.instance();
        return instance.state.get('helpingUsers');
    }
});

Template.search.events({
    'click pair-form-button'(event, instance) {
        event.preventDefault();
        console.log(event);
    }
})
