import './avatar.html';

import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { generateAvatar } from "../../api/util";

Template.avatar.onCreated(function() {
  this.state = new ReactiveDict();
  this.autorun(() => {
    const data = Template.currentData();
    new SimpleSchema({
      userId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
      },
      username: { type: String },
      tooltip: { type: Boolean }
    }).validate(data);
    this.state.setDefault({
      avatar: generateAvatar(data.username)
    });
  });

  const user = Meteor.users.findOne(Template.currentData().userId);
  if (user && user.profile.avatar) {
    const image = new Image();
    const url = user.profile.avatar;
    image.onload = () => {
      if (image.naturalHeight !== 0 && image.naturalWidth !== 0) {
        this.state.set('avatar', url);
      }
    };
    image.src = url;
  }
});

Template.avatar.onRendered(function() {
  // render tooltip if specified
  if (Template.currentData().tooltip) {
    this.$('.tooltipped').tooltip({ margin: 0 });
  }
});

Template.avatar.helpers({
  avatar() {
    const instance = Template.instance();
    return instance.state.get('avatar');
  },
});

