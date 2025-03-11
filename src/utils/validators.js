const Joi = require('joi');

const email = Joi.string().email().required();
const password = Joi.string().min(8).required();
const phone = Joi.string().pattern(/^[0-9]{10,15}$/).required();
const name = Joi.string().min(2).max(50).required();
const otp = Joi.string().length(6).pattern(/^[0-9]+$/).required();
const deviceId = Joi.string().required();
const deviceName = Joi.string().required();

const validators = {
  register: Joi.object({
    email,
    password,
    confirmPassword: Joi.ref('password'),
    phone,
    name,
    deviceId,
    deviceName
  }),
  
  login: Joi.object({
    email,
    password,
    deviceId,
    deviceName
  }),
  
  verifyEmail: Joi.object({
    email,
    otp
  }),
  
  forgotPassword: Joi.object({
    email
  }),
  
  resetPassword: Joi.object({
    email,
    otp,
    newPassword: password,
    confirmPassword: Joi.ref('newPassword')
  }),
  
  changeDevice: Joi.object({
    email,
    deviceId,
    deviceName,
    otp
  }),
  
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/),
    address: Joi.string().max(200),
    profilePicture: Joi.string()
  }),
  
  kycPersonalInfo: Joi.object({
    firstName: name,
    lastName: name,
    dateOfBirth: Joi.date().required(),
    nationality: Joi.string().required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    idType: Joi.string().valid('passport', 'nationalId', 'drivingLicense').required(),
    idNumber: Joi.string().required()
  }),
  
  kycAddressInfo: Joi.object({
    addressLine1: Joi.string().required(),
    addressLine2: Joi.string().allow(''),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required()
  }),
  
  transaction: Joi.object({
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).required(),
    type: Joi.string().valid('deposit', 'withdrawal', 'transfer').required(),
    description: Joi.string().max(200).allow(''),
    recipientId: Joi.string().when('type', {
      is: 'transfer',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  })
};

module.exports = validators;