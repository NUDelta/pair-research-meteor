import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Affinities } from './affinities.js';
import { Schema } from '../schema.js';
import { Auth, AuthMixin } from '../authentication.js';

export const updateAffinity = new ValidatedMethod({
  name: 'affinity.update',
  validate: Schema.Affinity.validator(),
  run({ helperId, helpeeId, groupId, value }) {
    if (this.userId != helperId) {
      throw new Meteor.Error('You don\'t have permissions to make this request.');
    }
    const record = Affinities.findOne({ helperId: helperId, helpeeId: helpeeId, groupId: groupId });
    if (record) {
      return Affinities.update(record._id, { $set: { value: value }});
    } else {
      return Affinities.insert({
        helperId: helperId,
        helpeeId: helpeeId,
        groupId: groupId,
        value: value
      });
    }

    // TODO: why don't i work
    //return Affinities.upsert({
    //  helperId: helperId,
    //  helpeeId: helpeeId,
    //  groupId: groupId
    //}, {
    //  $set: {
    //    helperId: helperId,
    //    helpeeId: helpeeId,
    //    groupId: groupId,
    //    value: value
    //  }
    //});
  }
});

export const clearAffinities = new ValidatedMethod({
  name: 'affinity.clear',
  validate: Schema.GroupUserQuery.validator(),
  mixins: [AuthMixin],
  allow: [Auth.GroupSelf],
  run({ groupId, userId }) {
    return Affinities.remove({
      groupId: groupId,
      $or: [
        {
          helperId: userId
        },
        {
          helpeeId: userId
        }
      ]
    });
  }
});

