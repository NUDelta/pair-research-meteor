import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/stevezhu:lodash';

import { Groups } from '../groups/groups.js';

export const findEmailFromToken = new ValidatedMethod({
  name: 'users.find.email.token',
  validate: new SimpleSchema({
    token: {
      type: String
    }
  }).validator(),
  run({ token }) {
    if (!this.isSimulation) {
      const user = Meteor.users.findOne({ 'services.password.reset.token': token });
      if (user) {
        return user.services.password.reset.email;
      } else {
        throw new Meteor.Error('invalid-token', 'The token provided does not match any known users.', JSON.stringify(token));
      }
    }
  }
});

export const setFullName = new ValidatedMethod({
  name: 'users.update.name',
  validate: new SimpleSchema({
    fullName: {
      type: String
    }
  }).validator(),
  run({ fullName }) {
    // TODO: might want structural changes...
    const user =  Meteor.users.findOne(this.userId);
    const groupIds = _.map(user.groups, group => group.groupId);
    Groups.find({
      _id: {
        $in: groupIds
      }
    }).forEach((group) => {
      const index = group.getMembershipIndex(this.userId);
      group.members[index].fullName = fullName;
      Groups.update(group._id, { $set: { members: group.members } });
    });
    return Meteor.users.update(this.userId, { $set: { 'profile.fullName': fullName} });
  }
});
