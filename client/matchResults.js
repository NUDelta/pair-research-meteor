if (Meteor.isClient) { 
    Template.matchResults.helpers({
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
