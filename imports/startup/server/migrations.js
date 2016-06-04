import { Meteor } from 'meteor/meteor';

import { Groups } from '../../api/groups/groups.js';

// 6/03/2016 nuking group info

Groups.remove({});
Meteor.users.update({},
  {
    $set: {
      groups: []
    }
  }
);
