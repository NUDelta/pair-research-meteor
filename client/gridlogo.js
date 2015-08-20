if (Meteor.isClient) {
  Template.gridlogo.helpers({
	gridSizedRow: function(){
		return [0, 0, 0,0]
	},
	gridSizedColumn: function(){
		return [0, 0, 0, 0, 0, 0,0,0,0,0,0,0]
	},
	randomColorGrid: function() {
		Session.get('logoRefreshed');
		if(Math.random() > 0.8) return "grid-colored";
		else return "grid-plain";
	}

  });

  Template.gridlogo.events({
  	'click button': function(e){
  		 Session.set('logoRefreshed', Math.random());
  	//	 console.log(Session.get('logoRefreshed'));
  	}

  })
}