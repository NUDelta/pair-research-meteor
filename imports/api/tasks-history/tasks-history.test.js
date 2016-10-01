import { TasksHistoryCollection } from './tasks-history.js';
import { chai } from 'meteor/practicalmeteor:chai';

describe('TasksHistory', function() {
  describe('wordIsNumber', function() {
    it('determines if a token is a purely numeric string', function() {
      chai.expect(TasksHistoryCollection.wordIsNumber('123')).to.be.true;
    });
  });
});
