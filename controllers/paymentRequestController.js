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

    if (!projectName || !department || !purpose || !amount || !requiredByDate ) {
      return res.status(400).json({ message: 'All fields are required' });
    }
        if (amount > 100000) {
      return res.status(400).json({ message: 'Payment amount cannot exceed ₹1,00,000' });
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
    const allowedStatuses = ['approved', 'rejected', 'hold'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const paymentRequest = await PaymentRequest.findById(req.params.id);

    if (!paymentRequest) {
      return res.status(404).json({ message: 'Payment request not found' });
    }

    paymentRequest.status = status;
    paymentRequest.processedBy = req.user.id;
    paymentRequest.processedAt = new Date();

    await paymentRequest.save();

    res.json(paymentRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePaymentRequest = async (req, res) => {
  try {
    const paymentRequest = await PaymentRequest.findByIdAndDelete(req.params.id);

    if (!paymentRequest) {
      return res.status(404).json({ message: 'Payment request not found' });
    }

    res.json({ message: 'Payment request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};