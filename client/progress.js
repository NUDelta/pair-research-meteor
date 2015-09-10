if (Meteor.isClient) {
    function lastEntryTime(collection) {
	var last = collection.findOne({}, {sort:{timestamp: -1}})
	if(last && last.timestamp) {
	    return last.timestamp / 1000;
	}
	else return ""
    }

    Template.progress.helpers({
	latestAffinity: function(){
	    return lastEntryTime(Affinity);
/*  var lastUpdate = Affinity.findOne({}, {sort:{timestamp: -1}})
	    if(lastUpdate && lastUpdate.timestamp) {
		return lastUpdate.timestamp / 1000;
	    }
	    else return ""
*/
	},
	lastClear: function(){
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
