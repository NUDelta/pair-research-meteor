if (Meteor.isClient) {
  Template.helpone.events({
    "change input": function(e) {
      var value = e.currentTarget.value;
      var context = {
        "value": parseFloat(value),
        "helper": Session.get("fullname_id"),
        "helpee": this._id
      };

      Meteor.call('updateAffinity', context, function(error, result) {
        // display the error to the user and abort
        if (error)
          return alert(error.reason);
      });
    }
  });

  Template.helpwho.helpers({
    enteredName: function() {
    return Session.get("fullname_id")

    },
    pool: function() {
      
        return Pool.find({
          _id: {
            $ne: Session.get("fullname_id")
          },
          need:  {
            $ne: ""
          }
        });

  }});

  Template.helpone.helpers({

    displayImage: function() {
      if (this.image) return this.image;
      else return "http://images.clipartpanda.com/sad-girl-stick-figure-image.png"
    }


  });
}