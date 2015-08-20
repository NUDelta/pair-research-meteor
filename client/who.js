

  if (Meteor.isClient) {

 var people = [
{"username":"stellathedog","image": "https://dl.dropboxusercontent.com/s/6mg35kb7e13gbik/stella.jpg", "name": "Stella"},
{"username":"lgerber","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2013/11/liz-250x250.jpg", "name": "Liz Gerber"},
{"username":"measterday","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2013/11/matt-250x250.jpg", "name": "Matt Easterday"},
{"username":"hzhang","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2013/11/haoqi-250x250.jpg", "name": "Haoqi Zhang"},
{"username":"mgreenberg","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2013/11/mike-250x250.jpg", "name": "Mike Greenberg"},
{"username":"jhui","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2013/11/julie-250x250.jpg", "name": "Julie Hui"},
{"username":"nsmirnov","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2013/11/natalia-250x250.jpg", "name": "Natalia Smirnov"},
{"username":"abethune","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2013/11/anna-250x250.jpg", "name": "Anna Bethune"},
{"username":"eharburg","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2013/11/emily-250x250.jpg", "name": "Emily Harburg"},
{"username":"ehunter","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2014/10/elizabeth.jpg", "name": "Elizabeth Hunter"},
{"username":"dlewis","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2013/11/dan-250x250.jpg", "name": "Daniel Rees Lewis"},
{"username":"gsaiyed","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2013/11/gulnaz-250x250.jpg", "name": "Gulu Saiyed"},
{"username":"jhibschman","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2014/09/josh.png", "name": "Josh Hibschman"},
{"username":"scambo","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2015/02/scott.jpg", "name": "Scott Cambo"},
{"username":"ykim","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2014/09/yongsung.jpg", "name": "Yongsung Kim"},
{"username":"ppahng","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2014/09/phoebe.jpeg", "name": "Phoebe Pahng"},
{"username":"zallen","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2014/09/zak.jpg", "name": "Zak Allen"},
{"username":"santonoplis","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2015/06/stephen.jpg", "name": "Stephen Antonoplis"},
{"username":"favino","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2015/02/frank.jpg", "name": "Frank Avino"},
{"username":"sazria","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2015/03/shana.png", "name": "Shana Azria"},
{"username":"bberger","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2014/09/bryan.jpg", "name": "Bryan Berger"},
{"username":"schan","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2013/11/stephen.jpg", "name": "Stephen Chan"},
{"username":"kchen","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2015/02/kevin1-square.jpg", "name": "Kevin Chen"},
{"username":"echou","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2015/07/betsy-150x150.jpg", "name": "Elizabeth Chou"},
{"username":"ccoravos","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2014/09/cassie.png", "name": "Cassie Coravos"},
{"username":"cgrief","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2014/09/corey.jpg", "name": "Corey Grief"},
{"username":"jhamad","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2014/10/joona.jpg", "name": "Joona Hamad"},
{"username":"ahollenbeck","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2014/09/alex.jpg", "name": "Alex Hollenbeck"},
{"username":"phouse","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2014/10/philip.jpg", "name": "Philip House"},
{"username":"pjayaram","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2015/07/pratap-150x150.jpg", "name": "Pratap Jayaram"},
{"username":"ckim","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2015/02/christina.jpg", "name": "Christina Kim"},
{"username":"akranjc","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2015/07/alicia-150x150.jpg", "name": "Alicia Kranjc"},
{"username":"slim","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2015/05/sarah.png", "name": "Sarah Lim"},
{"username":"klin","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2015/05/katherine.jpg", "name": "Katherine Lin"},
{"username":"lmaliakal","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2014/10/leesha.png", "name": "Leesha Maliakal"},
{"username":"cmccloskey","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2014/10/claire.jpg", "name": "Claire McCloskey"},
{"username":"dranti","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2013/11/danranti-250x250.jpg", "name": "Daniel Ranti"},
{"username":"brothman","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2014/09/ben.jpg", "name": "Ben Rothman"},
{"username":"jruffer","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2014/09/jonah.jpg", "name": "Jonah Ruffer"},
{"username":"ksilverman","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2014/10/kalina.jpg", "name": "Kalina Silverman"},
{"username":"hspindell","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2015/05/henry.jpg", "name": "Henry Spindell"},
{"username":"nzhu","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2013/11/nicole-250x250.jpg", "name": "Nicole Leigh Zhu"},
{"username":"ssami","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2014/10/sofia.png", "name": "Sofia Sami"},
{"username":"ssalgado","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2013/11/sergio-250x250.jpg", "name": "Sergio Salgado"},
{"username":"bharris","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2013/11/brantley-250x250.jpg", "name": "Brantley Harris"},
{"username":"arench","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2013/11/andy-250x250.jpg", "name": "Andy Rench"},
{"username":"axrench","image": "http://delta.northwestern.edu/wordpress/wp-content/uploads/2013/11/andy-250x250.jpg", "name": "Andy Rench"}

];

var peopleNames = people.map(function(x) {
          return x.name;
        });

function getDefaultImage(){
  return "http://images.clipartpanda.com/sad-girl-stick-figure-image.png"
}




    Template.who.rendered = function() {

      if (Session.get("fullname_id")) {        
        var person = Pool.findOne(Session.get("fullname_id"))
          // check if we have data on you already
           if(person) {
           $('#fullname').value = person.name
          }
        } 

      // set up the autocomplete
      $('#fullname').autocomplete({
        source: peopleNames,
        select: function(e, ui) {
          var value = e.target.value;

          var existingPerson = Pool.findOne({name: value})
          if (existingPerson) {
          // person alrady exists, so let's load their data
            Session.set("fullname_id", existingPerson._id)
            $("#need").val(existingPerson.need)
            return;
          }

          var image = people.filter(function(x) {
            return x.name == value
          })[0].image

          if (!Session.get("fullname_id"))
            Session.set("fullname_id", Pool.insert({
              "name": value,
              "need": $("#need").val(),
              "image": image
            }))
          else
            Pool.update(Session.get("fullname_id"), {
              $set: {
                'name': value,
                'image': image
              }
            });
        }
      });
    }

    Template.who.events({
      'input #fullname': function(e) {
        console.log("name input changed")
        var value = e.currentTarget.value;

        var existingPerson = Pool.findOne({name: value})
        if (existingPerson) {
          // person alrady exists, so let's load their data
            Session.set("fullname_id", existingPerson._id)
            $("#need").val(existingPerson.need)
            return;
        }

        if (!Session.get("fullname_id"))
          Session.set("fullname_id", Pool.insert({
            "name": value,
            "need": $("#need").val(),
            "image": getDefaultImage()
          }))
        else
          Pool.update({
              '_id': Session.get("fullname_id"), 
            }, {
              '_id': Session.get("fullname_id"),
              'name': value,
              'need': $("#need").val(),
              'image': getDefaultImage() 
            }, {upsert: true})
      }
    });
    

    Template.who.helpers({
      fullname: function() {
        if (Session.get("fullname_id")) {
          var person = Pool.findOne(Session.get("fullname_id"));
          if (person) {
            return person.name
          }
        }
        return ""
      }

    });

  }