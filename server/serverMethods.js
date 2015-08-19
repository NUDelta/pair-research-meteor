if (Meteor.isServer) {
  Meteor.methods({
    updateAffinity: function(context) {
      Affinity.update({
        "helper": context.helper,
        "helpee": context.helpee
      }, {
        "helper": context.helper,
        "helpee": context.helpee,
        "value": context.value
      }, {
        upsert: true
      })
    },
    getMatches: function(data) {
      try {
        var result = HTTP.call("POST", "http://groups.csail.mit.edu/uid/paired-research/match.cgi", {
          params: {
            "graph": data
          }
        });
        return result;
      } catch (e) {
        // Got a network error, time-out or HTTP error in the 400 or 500 range.
        return false;
      }
    }
  })

}