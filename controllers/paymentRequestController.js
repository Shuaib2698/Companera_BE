const PaymentRequest = require('../models/paymentRequestModel');

exports.createPaymentRequest = async (req, res) => {
  try {
    const {
      projectName,
      department,
      purpose,
      amount,
      description,
      requiredByDate,
      documentUrl
    } = req.body;

    // Validate required fields
    if (!projectName || !department || !purpose || !amount || !requiredByDate || !documentUrl) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const paymentRequest = new PaymentRequest({
      employee: req.user.id,
      projectName,
      department,
      purpose,
      amount,
      description,
      requiredByDate,
      documentUrl
    });

    await paymentRequest.save();
    res.status(201).json(paymentRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyPaymentRequests = async (req, res) => {
  try {
    const paymentRequests = await PaymentRequest.find({ employee: req.user.id })
      .sort({ createdAt: -1 });

    res.json(paymentRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPaymentRequests = async (req, res) => {
  try {
    const paymentRequests = await PaymentRequest.find()
      .sort({ createdAt: -1 })
      .populate('employee', 'name email department')
      .populate('processedBy', 'name');

    res.json(paymentRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePaymentRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const paymentRequest = await PaymentRequest.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        processedBy: req.user.id,
        processedAt: new Date()
      },
      { new: true }
    );

    if (!paymentRequest) {
      return res.status(404).json({ message: 'Payment request not found' });
    }

    res.json(paymentRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};