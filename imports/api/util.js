/**
 * Hash function for string to number.
 * @param {string} str
 * @returns {number}
 */
function hashString(str) {
  let hash = 0;
  _.times(str.length, i => {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  });
  return hash;
}

/**
 * Converts integers (numbers) to RGB codes.
 * @param {number} i
 * @returns {string} - e.g. 'FFFFFF'
 */
function intToRGB(i) {
  const c = (i & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();
  return '00000'.substring(0, 6 - c.length) + c;
}

/**
 * Converts strings into RGB codes.
 * @param {string} str
 * @returns {string}
 */
function hashStringColor(str) {
  return '#' + intToRGB(hashString(str));
}

/**
 * Retrieves up to two initials from a name.
 * @param {string} name
 * @returns {string}
 * @example
 * // returns 'KC'
 * getInitials('Kevin Chen')
 * // returns 'K'
 * getInitials('Kevin')
 */
function getInitials(name) {
  const initialsArray = name.match(/\b\w/g);
  return `${ initialsArray.shift() || '' }${ initialsArray.pop() || '' }`.toUpperCase();
}

/**
 * Generates a square avatar image data URI containing the specified text.
 * @locus client
 * @param {string} text
 * @param {string} color
 * @param {number} size
 * @returns {string}
 */
function generate(text, color, size) {
  let canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = size;
  canvas.height = size;
  context.font = Math.round(size / 2) + 'px Arial';
  context.textAlign = 'center';

  context.fillStyle = color;
  context.fillRect(0, 0, size, size);
  context.fillStyle = '#FFF';
  context.fillText(text, size / 2, size / 1.5);

  const dataURI = canvas.toDataURL();
  canvas = null;
  return dataURI;
}

/**
 * Generates a square avatar image data URI a users' initials.
 * @locus client
 * @param {string} name
 * @param {number} size
 * @returns {string}
 */
export const generateAvatar = (name, size = 100) => {
  const letters = getInitials(name);
  const color = hashStringColor(name);
  return generate(letters, color, size);
};

/**
 * Generates a square avatar image data URI containing specified text.
 * @locus client
 * @param {string} text
 * @param {string} color
 * @param {number} size
 * @returns {string}
 */
export const generateCustomAvatar = (name, color, size = 100) => {
  return generate(name, color, size);
};
