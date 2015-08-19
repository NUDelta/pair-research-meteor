if (Meteor.isClient) { 
  Template.matchResults.helpers({
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