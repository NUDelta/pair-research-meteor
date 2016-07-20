import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';

import { getTask } from './tasks.js';

import { Tasks } from '../api/tasks/tasks.js';

Factory.define('task', Tasks, {
  name: 'John Smith',
  userId: Random.id(),
  task: getTask(),
  groupId: Random.id()
});

