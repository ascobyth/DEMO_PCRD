const mongoose = require('mongoose');
const { Schema } = mongoose;

// Capability schema definition
const CapabilitySchema = new Schema(
  {
    capabilityName: {
      type: String,
      required: true
    },
    shortName: {
      type: String,
      required: true
    },
    capabilityDesc: {
      type: String
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location'
    },
    capHeadGroup: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reqRunNo: {
      type: Number
    },
    reqAsrRunNo: {
      type: String
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    collection: 'capabilities'
  }
);

module.exports = mongoose.models.Capability || mongoose.model('Capability', CapabilitySchema);
