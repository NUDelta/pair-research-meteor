import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Affinities } from './affinities.js';
import { Schema } from '../schema.js';
import { log } from '../logs.js';


export const updateAffinity = new ValidatedMethod({
  name: 'affinity.update',
  validate: Schema.Affinity.validator(),
  run({ helperId, helpeeId, groupId, value }) {
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

