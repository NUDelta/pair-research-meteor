import { _ } from 'meteor/stevezhu:lodash';

/**
 * Creates a sorted frequency array that counts the occurrences of elements in an array.
 *
 * @param {Array} array The array to be counted.
 * @returns {Array} Returns the sorted frequency array,
 *
 * e.g. [1, 1, 2, 1] => [[1, 3], [2, 1]]
 */
_.frequencyPairs = (array) => {
  return _.sortBy(_.toPairs(_.countBy(array)), pair => -pair[1]);
};