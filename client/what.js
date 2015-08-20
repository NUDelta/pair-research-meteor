  if (Meteor.isClient) {
    Template.what.helpers({
      name: function() {
        if (Session.get("fullname_id")) {
          var person = Pool.findOne(Session.get("fullname_id"));
          if (person) {
            return person.name
          }
        }
        return ""
      },

      displayImage: function() {
        if (Session.get("fullname_id")) {
          var person = Pool.findOne(Session.get("fullname_id"));
          if (person) {
            return person.image
          }
        } else {
        return "http://images.clipartpanda.com/sad-girl-stick-figure-image.png"
      }
    }
    });


  	Template.what.events({
  		'input #need': function(e) {
  			var value = e.currentTarget.value;
  			if (Session.get("fullname_id"))
  				Pool.update(Session.get("fullname_id"), {
  					$set: {
  						"need": value
  					}
  				});
  		},
  	});
  }