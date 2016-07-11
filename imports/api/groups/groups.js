import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/stevezhu:lodash';

import { Schema } from '../schema.js';

class GroupCollection extends Mongo.Collection {
  insert(group, callback) {
    return super.insert(group, callback);
  }

  remove(selector, callback) {
    // destroy all memberships
    this.find(selector).forEach((group) => {
      const memberIds = _.map(group.members, member => member._id);
      Meteor.users.update({
        _id: { $in: memberIds }
      }, {
        $pull: {
          groups: {
            groupId: group._id
          }
        }
      }, {
        multi: true
      });
    });
    return super.remove(selector, callback);
  }
}

export const Groups = new GroupCollection('groups');

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

// Unsure of this is the best solution but current implementation:
//  - title is a moniker. It should be unique, but won't be used for
//    anything except preferred pairing
//  - weight handles if admin, pending, or member
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
  fullName: {
    type: String,
    label: 'Member full name'
  },
  userId: {
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
      return Schema.ValidateEither(this, 'userId');
    }
  },
  role: {
    type: Schema.GroupRole
  }
});

export const RoleWeight = {
  Admin: 100,
  Member: 10,
  Pending: 1
};

export const DefaultRoles = {
  Admin: {
    title: 'Admin',
    weight: RoleWeight.Admin
  },
  Member: {
    title: 'Member',
    weight: RoleWeight.Member
  },
  Pending: {
    title: 'Pending',
    weight: RoleWeight.Pending
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

Groups.helpers({
  // TODO: should be for either userid or email
  getMembership(userId) {
    return _.find(this.members, member => member.userId == userId);
  },
  getRoleFromTitle(title) {
    return _.find(this.roles, role => role.title == title);
  },
  containsMember(userId) {
    return _.some(this.members, { userId: userId });
  },
  containsRole(role) {
    check(role, Schema.GroupRole);
    return _.some(this.roles, groupRole => groupRole.weight === role.weight && groupRole.title == role.title);
  },
  isGroupAdmin(userId) {
    const member = _.find(this.members, member => member.userId == userId);
    return member.role.weight === RoleWeight.Admin;
  },
  isPending(userId) {
    const member = _.find(this.members, member => member.userId == userId);
    return member.role.weight === RoleWeight.Pending;
  }
});
