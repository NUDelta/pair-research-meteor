// returns a complete weighted undirected graph on the people in the pair research pool.
// The return value is a Graph object:
//      graph.people is a list of nodes (specified as a person's name) 
//      graph.edges is a list of edges [i,j,w], where i and j are node numbers in the
//               graph.people list, and w is a numeric weight)
function generateGraph(pool, scores){
      var edgeList = [];
      var nodes = pool.map(function (x) { return x.name});


      for(var i = 0; i < pool.length; i++){
        for(var j = i+1; j < pool.length; j++){
              // don't match people when one of them said they can't be matched with the other
              var p1 = pool[i]._id;
              var p2 = pool[j]._id;
              if(scores[p1][p2] == -1 || scores[p2][p1] == -1) continue; 
      
              // First produce a weight based on their mutual prefs.  
              // Make it a positive value in 1-100, where 1 means both people said 0, and 100 means both people said 1.
              var w = 1 + 99*(scores[p1][p2] + scores[p2][p1]) / 2;
    
              // add a random perturbation, but keep it small enough that a pair rated 0.25/0.25 will never be better than a pair rated 0.5/0.5.
              w += Math.random()*20;

              // now make it an integer, because edge weights have to be positive integers    
              w = Math.floor(w);

              edgeList.push([i,j,w]);
        }
      }

      console.log("nodes", nodes)
      console.log("edges", edgeList)
      return {"people": nodes, "edges": edgeList};     
}

// gets the weight for the edge between person i and person j
function getWeight(graph, i, j) {
  for (var k = 0; k < graph.edges.length; ++k) {
    edge = graph.edges[k];
    if ((edge[0] == i && edge[1] == j) || (edge[0] == j && edge[1] == i)) {
      return edge[2];
    }
  }
}

// shuffle an array.  Modifies the array and also returns it.
function shuffle(a) {
  for (var i = a.length - 1; i > 0; --i) {
    // swap a random element from a[0..i] with a[i]
    var j = Math.floor(Math.random() * (i + 1));
    var x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

function processMatches(response, graph){
  
  var matches = response.data 

  // extract the results into a Matching list
  var matching = [];  
  // first find all the matched pairs
  for (var i in matches) { 
    if (i < matches[i]) {
      matching.push(shuffle([graph.people[i], graph.people[matches[i]]]));
      console.log(getWeight(graph, i, matches[i]) + " " + graph.people[i] + "," + graph.people[matches[i]]);
    }
  }
  // shuffle the pairs so the matching doesn't always display professors at the top of the list
  shuffle(matching); 
  // now add the unmatched singletons
  for (var i in matches) { 
    if (matches[i] == -1) {
      matching.push([graph.people[i]]);
      console.log("unmatched " + graph.people[i]);
    }
  }
    
  console.log(matching)

  Matches.insert({matching: matching, timestamp: new Date().getTime()})
}

if (Meteor.isClient) {
  Template.match.events({
    "click #clearPool": function (e) {

      if(confirm("This will clear the current pair research pool and people's stated needs. Ok?"))
      Meteor.call('clearPool', function(error, result) {
	  if(error) console.log(error)
       });
    },

    "click #getMatches": function(e) {
	if(confirm("We will now pair people based on who they said they could help. Ok?")){
	    
	    // 1. Get the pool
	    var pool = Pool.find({need: {$ne: ""}}).fetch();
	    
	    
	    // 2. Get the preferences
	    var affinities = Affinity.find().fetch();
	    var scores = {};
	    for(var i = 0; i < pool.length; i++){
		scores[pool[i]._id] = {}
		for(var j = 0; j < pool.length; j++){
		    if(i == j) continue;
		    scores[pool[i]._id][pool[j]._id] = 0 
		}
	    }
	    for(var i = 0; i < affinities.length; i++) {
		if(affinities[i].helper in scores && affinities[i].helpee in scores[affinities[i].helper])
		    scores[affinities[i].helper][affinities[i].helpee] = affinities[i].value
	    }
	    
	    // 3. Generate the graph
	    var graph = generateGraph(pool, scores);
	    
	    // 4. Send it off for matching
	    Meteor.call('getMatches', JSON.stringify(graph.edges), function(error, result) {
		if(!error) processMatches(result, graph)
	    });
	}
    }
  });
}
