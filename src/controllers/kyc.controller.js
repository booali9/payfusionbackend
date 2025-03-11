const KYC = require('../models/KYC');
const User = require('../models/User');
const kycService = require('../services/kyc.service');

exports.submitKYC = async (req, res, next) => {
  try {
    const { idType, idNumber, idExpiryDate, dateOfBirth, address } = req.body;
    const userId = req.user.id;

    if (!req.files || !req.files.frontIdImage || !req.files.backIdImage || !req.files.selfieImage) {
      return res.status(400).json({
        success: false,
        message: 'All required documents must be uploaded'
      });
    }

    const existingKYC = await KYC.findOne({ userId });
    if (existingKYC) {
      await KYC.findByIdAndDelete(existingKYC._id);
    }

    const kycData = {
      userId,
      idType,
      idNumber,
      idExpiryDate: new Date(idExpiryDate),
      dateOfBirth: new Date(dateOfBirth),
      address: JSON.parse(address),
      frontIdImage: req.files.frontIdImage[0].path,
      backIdImage: req.files.backIdImage[0].path,
      selfieImage: req.files.selfieImage[0].path,
      status: 'PENDING'
    };

    await KYC.create(kycData);

    await kycService.processKYC(userId);

    res.status(201).json({
      success: true,
      message: 'KYC submitted successfully and is under review'
    });
  } catch (error) {
    next(error);
  }
};

exports.getKYCStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const kyc = await KYC.findOne({ userId });
    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: 'KYC information not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: kyc.status,
        submittedAt: kyc.createdAt,
        updatedAt: kyc.updatedAt,
        rejectionReason: kyc.rejectionReason
      }
    });
  } catch (error) {
    next(error);
  }
};