import { typeList } from '../constants/contacts.js';

const parseType = (contactType) => {
  if (typeof contactType !== 'string') return;

  const normalizedType = contactType.toLowerCase().trim();

  if (typeList.includes(normalizedType)) {
    return normalizedType;
  }
};

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;

  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }

  return undefined;
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
