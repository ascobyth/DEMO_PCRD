const mongoose = require('mongoose');
const { Schema } = mongoose;

// SampleSet schema definition
const SampleSetSchema = new Schema(
  {
    sampleSetName: {
      type: String,
      required: true,
      trim: true
    },
    requesterName: {
      type: String,
      required: true
    },
    requesterEmail: {
      type: String,
      required: true,
      lowercase: true
    },
    ioNumber: {
      type: String,
      default: ''  // Empty string if no IO number
    },
    samplesJson: {
      type: String,  // JSON string containing all sample information
      required: true
    },
    sampleCount: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    collection: 'sample_sets'
  }
);

// Index for efficient querying
SampleSetSchema.index({ requesterEmail: 1, ioNumber: 1 });
SampleSetSchema.index({ sampleSetName: 1 });

module.exports = mongoose.models.SampleSet || mongoose.model('SampleSet', SampleSetSchema);