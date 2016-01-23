if (Meteor.isClient) {
    Meteor.setInterval(function(){ Session.set('currentTime',  new Date().getTime() / 1000)}, 1000);

    function lastEntryTime(collection) {
	var last = collection.findOne({}, {sort:{timestamp: -1}})
	if(last && last.timestamp) {
	    return last.timestamp / 1000;
	}
	else return null;
    }

    Template.progress.helpers({
	currentPulse: function(){
	    var lastChange = lastEntryTime(Affinity);
	    var currentTime = Session.get('currentTime')
	    // TODO: this needs to be a reactive computation....
	    // or couldn't it just be a setInterval?? 
	    // could store currentTime in a session variable, so that
	    // as long as that updated, then this computation will have to run..
	    // and could use set interval to update a session variable
	    if (currentTime - lastChange < 10) {
		return "progressRing pulsing"
	    }else {
		return "progressRing"
	    }
	
	},

	latestAffinity: function(){
	    console.log("triggered aff")
	    return lastEntryTime(Affinity);
	},
	lastClear: function(){
	    console.log("triggered last")
	    return lastEntryTime(History);
	},
	numAffinities: function(){
	    var affs = Affinity.find();
	    return affs.count()
	},
	numPeople: function(){
	    var peeps = Pool.find({need: {$ne: ""}});
	    return peeps.count()
	}
    })
}
