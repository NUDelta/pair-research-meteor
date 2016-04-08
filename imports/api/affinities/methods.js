import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { Affinities } from './affinities.js';
import { Schema } from '../schema.js';
import { log } from '../logs.js';

export const updateAffinity = new ValidatedMethod({
  name: 'affinity.update',
  validate: Schema.Affinity.validator(),
  run({ helperId, helpeeId, groupId, value }) {
    return Affinities.upsert({
      helperId: helperId,
      helpeeId: helpeeId,
      groupId: groupId
    }, {
      $set: {
        helperId: helperId,
        helpeeId: helpeeId,
        groupId: groupId,
        value: value
      }
    });
  }
});