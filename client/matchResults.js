if (Meteor.isClient) { 

    Template.matchResults.rendered = function() {
	// TODO: hacky.. some checks may be unnecessary? probably need subscriptions and readys?
	
	Tracker.autorun(function(){
	// scroll to match results whenever match results update
	var lastMatch = Matches.findOne({}, {sort:{timestamp: -1}})
	var lastClear = History.findOne({}, {sort:{timestamp: -1}})
	if(lastMatch && lastClear && lastMatch.timestamp && lastClear.timestamp && 
	   (lastMatch.timestamp > lastClear.timestamp) && 
	   (lastMatch.timestamp + 10000 > new Date().getTime()))  {
	    if($("#matchResults") && $("#matchResults").offset()){
		console.log("scrolling to results...")
		
		$('html, body').animate({
		    scrollTop: $("#matchResults").offset().top
		}, 1000);
	    }
	}
	})
    };
    
    Template.matchResults.helpers({
	lastMatchFromCurrentPool: function(){
	    var lastMatch = Matches.findOne({}, {sort:{timestamp: -1}})
	    var lastClear = History.findOne({}, {sort:{timestamp: -1}})
	    if(lastMatch && lastClear && lastMatch.timestamp && lastClear.timestamp) 
		return lastMatch.timestamp > lastClear.timestamp;
	    return false
	},

	lastMatchTime: function(){
            var matches = Matches.findOne({}, {sort:{timestamp: -1}})
            if(matches && matches.timestamp) return moment(matches.timestamp).fromNow()
            else return ""
      }, 
      displayImageOne: function(){
	    
	  return displayImageFromName(this[0])
      },
      displayImageTwo: function(){
	  return displayImageFromName(this[1])
      },
      match: function() {

          var matches =  Matches.findOne({}, {sort:{timestamp: -1}})
          if(matches) return matches.matching
          else return []
      },
      matched: function() {
        return this.length == 2;
      },
      personOne: function(){
         return this[0] 
      },
      personTwo: function(){
         return this[1] 
      }
    });
}
