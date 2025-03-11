const KYC = require('../models/KYC');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const emailService = require('./email.service');

class KycService {
  async submitKYC(userId, kycData, files) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    let existingKYC = await KYC.findOne({ userId });
    
    if (existingKYC) {
      existingKYC.status = 'pending';
      existingKYC.personalInfo = kycData.personalInfo;
      existingKYC.addressInfo = kycData.addressInfo;
      existingKYC.documents = this._processDocuments(files);
      existingKYC.updatedAt = Date.now();
      
      await existingKYC.save();
      return existingKYC;
    }
    
    const newKYC = new KYC({
      userId,
      personalInfo: kycData.personalInfo,
      addressInfo: kycData.addressInfo,
      documents: this._processDocuments(files),
      status: 'pending'
    });
    
    await newKYC.save();
    return newKYC;
  }

  _processDocuments(files) {
    const documents = {};
    
    if (files.idProof) {
      documents.idProof = {
        filename: files.idProof.filename,
        path: files.idProof.path,
        mimetype: files.idProof.mimetype
      };
    }
    
    if (files.addressProof) {
      documents.addressProof = {
        filename: files.addressProof.filename,
        path: files.addressProof.path,
        mimetype: files.addressProof.mimetype
      };
    }
    
    if (files.selfie) {
      documents.selfie = {
        filename: files.selfie.filename,
        path: files.selfie.path,
        mimetype: files.selfie.mimetype
      };
    }
    
    return documents;
  }

  async getKYCStatus(userId) {
    const kyc = await KYC.findOne({ userId });
    if (!kyc) {
      return { status: 'not_submitted' };
    }
    return { status: kyc.status };
  }

  async updateKYCStatus(kycId, status, remarks = '') {
    const kyc = await KYC.findById(kycId);
    if (!kyc) {
      throw new Error('KYC record not found');
    }
    
    kyc.status = status;
    kyc.remarks = remarks;
    kyc.updatedAt = Date.now();
    
    await kyc.save();
    
    const user = await User.findById(kyc.userId);
    if (user) {
      await emailService.sendKYCStatusEmail(user.email, status);
    }
    
    return kyc;
  }
}

module.exports = new KycService();