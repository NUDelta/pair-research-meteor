displayImageFromName = function(name){
    var person = Pool.findOne({name:name})
    if (person && person.image) return person.image
    else return "http://images.clipartpanda.com/sad-girl-stick-figure-image.png"
};

