import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export const formatString = (array, getName = (item) => item) => {
  if (!array || array.length === 0) return "";

  const names = array.map(getName);

  const firstWord = names[0].charAt(0).toUpperCase() + names[0].slice(1);
  const string =
    names.length === 1
      ? firstWord + "."
      : names.length === 2
      ? firstWord + " e " + names[1] + "."
      : firstWord +
        ", " +
        names.slice(1, -1).join(", ") +
        " e " +
        names.at(-1) +
        ".";

  return string;
};

export default api;
