export const hasMoreThan2Letters = (translation) => {
  return translation.trim().length > 2;
};

export const hasNoRepeatLetters = (translation) => {
  const uniqLetters = new Set(Array.from(translation));
  return uniqLetters.size === translation.length;
};

export const hasOnlyLowercaseLetters = (translation) => {
  const regexp = /^[a-z]+$/;
  return regexp.test(translation);
};