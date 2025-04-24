import { typeList } from '../constants/contacts.js';

const parseType = (type) => {
  const isString = typeof type === 'string';
  if (!isString) return;

  const isType = (type) => typeList.includes(type);
  if (isType(type)) return type;
};

const parseBoolean = (boolean) => {
  const isString = typeof boolean === 'string';
  if (!isString) return;

  const normalizedBoolean = boolean.toLowerCase().trim();

  if (normalizedBoolean === 'true') return true;
  if (normalizedBoolean === 'false') return false;

  return;
};

const parsePhoneNumber = (number) => {
  const isString = typeof number === 'string';
  if (!isString) return;

  const cleanedNumber = number.trim();

  return cleanedNumber;
};

export const parseFilterParams = (query) => {
  const { type, isFavourite, phoneNumber } = query;

  const parsedType = parseType(type);
  const parsedIsFavourite = parseBoolean(isFavourite);
  const parsedPhoneNumber = parsePhoneNumber(phoneNumber);

  return {
    contactType: parsedType,
    isFavourite: parsedIsFavourite,
    phoneNumber: parsedPhoneNumber,
  };
};
