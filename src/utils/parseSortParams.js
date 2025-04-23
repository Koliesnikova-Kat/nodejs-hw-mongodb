import { SORT_ORDER } from '../constants/index.js';

const parseSortOrder = (sortOrder) => {
  const isKnownOrder = [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(sortOrder);

  if (isKnownOrder) return sortOrder;

  return SORT_ORDER.ASC;
};

const parseSortBy = (sortBy, sortFields) => {
  if (sortFields.includes(sortBy)) {
    return sortBy;
  }

  return 'name';
};

export const parseSortParams = (query, sortFields = ['name']) => {
  const { sortOrder, sortBy } = query;

  const parsedSortOrder = parseSortOrder(sortOrder);
  const parsedSortBy = parseSortBy(sortBy, sortFields);

  return {
    sortOrder: parsedSortOrder,
    sortBy: parsedSortBy,
  };
};
