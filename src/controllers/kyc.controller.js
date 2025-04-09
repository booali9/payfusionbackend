const KYC = require('../models/KYC');
const User = require('../models/User');
const kycService = require('../services/kyc.service');

exports.submitKYC = async (req, res, next) => {
  try {
    const { idType, idNumber, idExpiryDate, dateOfBirth } = req.body;
    const userId = req.user.id;

    // Validate required files
    if (!req.files || !req.files.frontIdImage || !req.files.backIdImage || !req.files.selfieImage) {
      return res.status(400).json({
        success: false,
        message: 'All required documents must be uploaded'
      });
    }

    // Handle address properly - could be string or object
    let parsedAddress;
    try {
      // If address is a string, parse it
      if (typeof req.body.address === 'string') {
        parsedAddress = JSON.parse(req.body.address);
      } else if (typeof req.body.address === 'object') {
        // If it's already an object, use it directly
        parsedAddress = req.body.address;
      } else {
        // If no address provided or invalid format
        return res.status(400).json({
          success: false,
          message: 'Valid address information is required'
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address format. Please provide a valid JSON object',
        errors: [error.message]
      });
    }

    // Check for existing KYC and remove if found
    const existingKYC = await KYC.findOne({ userId });
    if (existingKYC) {
      await KYC.findByIdAndDelete(existingKYC._id);
    }

    // Create KYC data with properly parsed address
    const kycData = {
      userId,
      idType,
      idNumber,
      idExpiryDate: new Date(idExpiryDate),
      dateOfBirth: new Date(dateOfBirth),
      address: parsedAddress,
      frontIdImage: req.files.frontIdImage[0].path,
      backIdImage: req.files.backIdImage[0].path,
      selfieImage: req.files.selfieImage[0].path,
      status: 'PENDING'
    };

    // Create KYC record
    await KYC.create(kycData);
    
    // Update user's KYC status
    await User.findByIdAndUpdate(userId, { isKYCVerified: false, isKYCSubmitted: true });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'KYC submitted successfully and is under review'
    });
  } catch (error) {
    console.error('KYC submission error:', error);
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
exports.reviewKYC = async (req, res, next) => {
  try {
    const { kycId, status, rejectionReason } = req.body;
    // Add admin verification here
    
    const kyc = await KYC.findByIdAndUpdate(kycId, 
      { status, rejectionReason },
      { new: true }
    );
    
    if (status === 'APPROVED') {
      await User.findByIdAndUpdate(kyc.userId, { isKYCVerified: true });
    }
    
    res.status(200).json({
      success: true,
      data: kyc
    });
  } catch (error) {
    next(error);
  }
};