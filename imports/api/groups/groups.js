import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/stevezhu:lodash';

import { Schema } from '../schema.js';

class GroupCollection extends Mongo.Collection {
  insert(group, callback) {
    return super.insert(group, callback);
  }

  update(selector, callback) {
    return super.update(selector, callback);
  }

  remove(selector, callback) {
    // destroy all memberships
    return super.remove(selector, callback);
  }
}

export const Groups = new GroupCollection('groups');

Schema.GroupRole = new SimpleSchema({
  title: {
    type: String
  },
  weight: {
    type: Number
  }
});

SimpleSchema.messages({
  either: '[label] or its partner field must be included'
});

Schema.ValidateEither = (context, partner) => {
  let tokens = context.key.split('.');
  tokens[tokens.length - 1] = partner;
  const field = tokens.join('.');
  if (!context.field(field).isSet && !context.value) {
    return 'either';
  }
};

// maybe add more fields?
Schema.Member = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
    custom() {
      return Schema.ValidateEither(this, 'email');
    }
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true,
    custom() {
      return Schema.ValidateEither(this, '_id');
    }
  },
  role: {
    type: Schema.GroupRole
  }
});

export const DefaultRoles = {
  Admin: {
    title: 'Admin',
    weight: 100
  },
  Member: {
    title: 'Member',
    weight: 10
  },
  Pending: {
    title: 'Pending',
    weight: 1
  }
};

Schema.Group = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  groupName: {
    type: String
  },
  description: {
    type: String
  },
  creatorId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  creatorName: {
    type: String
  },
  creationDate: {
    type: Date
  },
  activePairing: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  // TODO: implement user roles
  roles: {
    type: Array,
    optional: true,
    defaultValue: _.values(DefaultRoles)
  },
  'roles.$': {
    type: Schema.GroupRole
  },
  members: {
    type: Array,
    optional: true,
    defaultValue: []
  },
  'members.$': {
    type: Schema.Member
  },
  publicJoin: {
    type: Boolean
  },
  allowGuests: {
    type: Boolean
  }
});

Groups.attachSchema(Schema.Group);

Groups.allow({
  insert(userId, doc) {
    return doc.creatorId == userId;
  }
});

Schema.GroupUserQuery = new SimpleSchema({
  groupId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  }
});
