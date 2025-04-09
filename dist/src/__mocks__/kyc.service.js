module.exports = {
    submitKYC: jest.fn().mockResolvedValue({
      _id: 'mock-kyc-id',
      userId: 'mock-user-id',
      status: 'pending'
    }),
    getKYCStatus: jest.fn().mockResolvedValue({
      status: 'pending'
    }),
    updateKYCStatus: jest.fn().mockResolvedValue({
      _id: 'mock-kyc-id',
      userId: 'mock-user-id',
      status: 'approved'
    }),
    _processDocuments: jest.fn().mockReturnValue([{
      type: 'id',
      path: '/uploads/mock-doc.jpg'
    }])
  };