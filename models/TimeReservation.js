const mongoose = require('mongoose');

const timeReservationSchema = new mongoose.Schema({
  reservationId: {
    type: String,
    required: true,
    unique: true,
    default: () => `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
  equipmentId: {
    type: String,
    required: true
  },
  equipmentName: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  createdByEmail: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
timeReservationSchema.index({ equipmentId: 1, startTime: 1, endTime: 1 });
timeReservationSchema.index({ status: 1 });

// Update timestamp on save
timeReservationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const TimeReservation = mongoose.models.TimeReservation || mongoose.model('TimeReservation', timeReservationSchema);

module.exports = TimeReservation;