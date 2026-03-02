import { avatarColors } from "components/constants/Colors";


export const getColorForUsername = (username) => {
  const hash = username
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
};