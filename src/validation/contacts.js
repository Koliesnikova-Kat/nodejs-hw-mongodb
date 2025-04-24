import Joi from 'joi';
import { typeList } from '../constants/contacts.js';

const phoneRegex = /^\+?\d[\d\s-]{3,20}\d$/;

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required().messages({
    'string.base': 'Contact name should be a string',
    'string.min': 'Contact name should have at least {#limit} characters',
    'string.max': 'Contact name should have at most {#limit} characters',
    'any.required': 'Contact name is required',
  }),
  phoneNumber: Joi.string().pattern(phoneRegex).required().messages({
    'string.pattern.base':
      'Phone number must be a valid number (3-20 digits, optional +)',
    'any.required': 'Phone number is required',
  }),
  email: Joi.string().email({ minDomainSegments: 2 }).messages({
    'string.base': 'Email must be a string',
    'string.email': 'Please enter a valid email address, like example@mail.com',
    'any.required': 'Email is required',
  }),
  isFavourite: Joi.boolean(),
  contactType: Joi.string()
    .valid(...typeList)
    .required()
    .messages({
      'any.only': 'Contact type must be one of: work, home, or personal',
      'string.base': 'Contact type must be a string',
      'any.required': 'Contact type is required',
    }),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(30).messages({
    'string.base': 'Contact name should be a string',
    'string.min': 'Contact name should have at least {#limit} characters',
    'string.max': 'Contact name should have at most {#limit} characters',
    'any.required': 'Contact name is required',
  }),
  phoneNumber: Joi.number().integer().min(3).max(30).messages({
    'string.pattern.base':
      'Phone number must be a valid number (3-20 digits, optional +)',
    'any.required': 'Phone number is required',
  }),
  email: Joi.string().email({ minDomainSegments: 2 }).messages({
    'string.base': 'Email must be a string',
    'string.email': 'Please enter a valid email address, like example@mail.com',
    'any.required': 'Email is required',
  }),
  isFavourite: Joi.boolean(),
  contactType: Joi.string()
    .valid(...typeList)
    .messages({
      'any.only': 'Contact type must be one of: work, home, or personal',
      'string.base': 'Contact type must be a string',
      'any.required': 'Contact type is required',
    }),
});
