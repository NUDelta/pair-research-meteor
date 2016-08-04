
function hashString(str) {
  let hash = 0;
  _.times(str.length, i => {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  });
  return hash;
}

function intToRGB(i) {
  const c = (i & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();
  return '00000'.substring(0, 6 - c.length) + c;
}

function hashStringColor(str) {
  return '#' + intToRGB(hashString(str));
}

function getInitials(name) {
  const initialsArray = name.match(/\b\w/g);
  return `${ initialsArray.shift() || '' }${ initialsArray.pop() || '' }`.toUpperCase();
}

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

// @client-side
export const generateAvatar = (name, size = 100) => {
  const letters = getInitials(name);
  const color = hashStringColor(name);
  return generate(letters, color, size);
};

export const generateCustomAvatar = (name, color, size = 100) => {
  return generate(name, color, size);
};
