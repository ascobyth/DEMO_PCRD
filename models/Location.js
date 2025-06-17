const mongoose = require('mongoose');
const { Schema } = mongoose;

// Location schema definition
const LocationSchema = new Schema(
  {
    locationId: {
      type: String,
      required: true,
      unique: true
    },
    sublocation: {
      type: String
    },
    contactPerson: {
      type: String
    },
    sendingAddress: {
      type: String
    },
    contactNumber: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    address: {
      type: String
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    collection: 'locations'
  }
);

// Add virtuals for related models
LocationSchema.virtual('testingMethods', {
  ref: 'TestingMethod',
  localField: '_id',
  foreignField: 'locationId'
});

LocationSchema.virtual('equipment', {
  ref: 'Equipment',
  localField: '_id',
  foreignField: 'locationId'
});

LocationSchema.virtual('capabilities', {
  ref: 'Capability',
  localField: '_id',
  foreignField: 'locationId'
});

module.exports = mongoose.models.Location || mongoose.model('Location', LocationSchema);
