history = History.findOne();
if (!history) {
    History.insert({timestamp: new Date().getTime()})
}
