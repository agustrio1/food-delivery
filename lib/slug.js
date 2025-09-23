import slugify from 'slugify';

// Configure slugify default options
const defaultSlugOptions = {
  lower: true,
  strict: true,
  remove: /[*+~.()'"!:@]/g
};

export const generateSlug = (text, options = {}) => {
  return slugify(text, { ...defaultSlugOptions, ...options });
};

export const generateUniqueSlug = async (text, checkFunction, options = {}) => {
  const baseSlug = generateSlug(text, options);
  let finalSlug = baseSlug;
  let counter = 1;
  
  while (await checkFunction(finalSlug)) {
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return finalSlug;
};