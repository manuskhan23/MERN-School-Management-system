// client/src/utils/avatarUtils.js

// A predefined array of colors for random avatar backgrounds
const colors = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33F0', '#F0FF33', '#33F0FF',
  '#FF8C33', '#33FF8C', '#8C33FF', '#FF338C', '#8CFF33', '#338CFF',
  '#FFC300', '#C3FF00', '#00FFC3', '#FF00C3', '#C300FF', '#00C3FF',
];

export const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

export const getFirstLetter = (name) => {
  if (!name || typeof name !== 'string' || name.trim() === '') return '';
  return name.trim().charAt(0).toUpperCase();
};