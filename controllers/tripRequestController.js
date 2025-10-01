// controllers/tripRequestController.js
const TripRequest = require('../models/TripRequest');

exports.createTripRequest = async (req, res) => {
  try {
    const {
      tripPurpose,
      destination,
      startDate,
      endDate,
      estimatedCost,
      country,
      zipCode,
      description,
      documentUrl
    } = req.body;

    if (!tripPurpose || !destination || !startDate || !endDate || !estimatedCost) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const tripRequest = new TripRequest({
      employee: req.user.id,
      tripPurpose,
      destination,
      startDate,
      endDate,
      estimatedCost,
      country,
      zipCode,
      description,
      documentUrl
    });

    await tripRequest.save();
    await tripRequest.populate('employee', 'name email department');
    res.status(201).json(tripRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyTripRequests = async (req, res) => {
  try {
    const tripRequests = await TripRequest.find({ employee: req.user.id })
      .sort({ createdAt: -1 });

    res.json(tripRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTripRequests = async (req, res) => {
  try {
    const tripRequests = await TripRequest.find()
      .sort({ createdAt: -1 })
      .populate('employee', 'name email department');

    res.json(tripRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTripRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'approved', 'rejected'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const tripRequest = await TripRequest.findById(req.params.id);

    if (!tripRequest) {
      return res.status(404).json({ message: 'Trip request not found' });
    }

    tripRequest.status = status;
    await tripRequest.save();

    res.json(tripRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTripRequest = async (req, res) => {
  try {
    const tripRequest = await TripRequest.findById(req.params.id);

    if (!tripRequest) {
      return res.status(404).json({ message: 'Trip request not found' });
    }

    // Only admin or the employee who created the request can delete it
    if (req.user.role !== 'admin' && tripRequest.employee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await TripRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trip request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};