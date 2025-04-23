import { typeList } from '../constants/index.js';

const parseType = (contactType) => {
  const isString = typeof contactType === 'string';
  if (!isString) return;

  const isType = (contactType) => typeList.includes(contactType);
  if (isType(contactType)) return contactType;
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
  const { contactType, isFavourite, phoneNumber } = query;

  const parsedType = parseType(contactType);
  const parsedIsFavourite = parseBoolean(isFavourite);
  const parsedPhoneNumber = parsePhoneNumber(phoneNumber);

  return {
    contactType: parsedType,
    isFavourite: parsedIsFavourite,
    phoneNumber: parsedPhoneNumber,
  };
};
