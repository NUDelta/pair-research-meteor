if (Meteor.isServer) {
  Meteor.methods({
    updateAffinity: function(context) {
      Affinity.update({
        "helper": context.helper,
        "helpee": context.helpee
      }, {
        "helper": context.helper,
        "helpee": context.helpee,
        "value": context.value,
	"timestamp": new Date().getTime()
      }, {
        upsert: true
      })
    },
    clearPool: function(){
	// TODO: should insert more history than just when the pool got cleared
	History.insert({timestamp: new Date().getTime()})
	Pool.remove({})
	Affinity.remove({})
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
