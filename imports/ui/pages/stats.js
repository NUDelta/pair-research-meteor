import './stats.html'

import {Tasks} from '../../api/tasks/tasks.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import {getStats} from '../../api/stats/methods.js'

Template.stats.events({
	'click .timestamp-link': function(event, instance){
		event.preventDefault();
		var timestamp = event.target.innerHTML;

		getStats.call({
			timestamp: timestamp
		}, (err, result) => {
			if (err) {
				console.log(err);
			} else {
				task_list = [];
				for (key in result){
					var task = {}
					var score = result[key]["value"]
					task["task"] = key;
					task["score"] = score;
					task_list.push(task);
				}
				task_list.sort(function(a, b) {
					return a.score - b.score;
				})
				instance.state.set('tasks', task_list);
			}
		});
	}
});

Template.stats.onCreated(function() {
	this.state = new ReactiveDict();
	this.state.setDefault({
		tasks: null
	})
})

Template.stats.helpers({
    timestamps() {
        var timestampArray = [
            {time: "1478894867946000000L"},
            {time: "1478903113043000000L"},
            {time: "1480525104766000000L"},
            {time: "1484340141850000000L"},
            {time: "1484944273981000000L"},
            {time: "1485548718607000000L"},
            {time: "1485807728928000000L"},
            {time: "1486154344310000000L"},
            {time: "1486757752166000000L"},
            {time: "1487969832351000000L"}
        ]
        return timestampArray
    },
	tasks() {
		const instance = Template.instance();
		return instance.state.get('tasks');
	}
});
