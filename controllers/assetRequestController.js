// controllers/assetRequestController.js
const AssetRequest = require('../models/AssetRequest');

exports.createAssetRequest = async (req, res) => {
  try {
    const {
      requestType,
      assetType,
      preferredModel,
      quantity,
      purpose,
      estimatedCost,
      urgency,
      country,
      zipCode,
      description,
      documentUrl
    } = req.body;

    if (!requestType || !assetType || !purpose) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const assetRequest = new AssetRequest({
      employee: req.user.id,
      requestType,
      assetType,
      preferredModel,
      quantity: quantity || 1,
      purpose,
      estimatedCost,
      urgency: urgency || 'medium',
      country,
      zipCode,
      description,
      documentUrl
    });

    await assetRequest.save();
    await assetRequest.populate('employee', 'name email department');
    res.status(201).json(assetRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyAssetRequests = async (req, res) => {
  try {
    const assetRequests = await AssetRequest.find({ employee: req.user.id })
      .sort({ createdAt: -1 });

    res.json(assetRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAssetRequests = async (req, res) => {
  try {
    const assetRequests = await AssetRequest.find()
      .sort({ createdAt: -1 })
      .populate('employee', 'name email department');

    res.json(assetRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAssetRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'approved', 'rejected'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const assetRequest = await AssetRequest.findById(req.params.id);

    if (!assetRequest) {
      return res.status(404).json({ message: 'Asset request not found' });
    }

    assetRequest.status = status;
    await assetRequest.save();

    res.json(assetRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAssetRequest = async (req, res) => {
  try {
    const assetRequest = await AssetRequest.findById(req.params.id);

    if (!assetRequest) {
      return res.status(404).json({ message: 'Asset request not found' });
    }

    // Only admin or the employee who created the request can delete it
    if (req.user.role !== 'admin' && assetRequest.employee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await AssetRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Asset request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};