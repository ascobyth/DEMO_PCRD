const mongoose = require('mongoose');
const { Schema } = mongoose;

// IO schema definition
const IoSchema = new Schema(
  {
    ioNo: {
      type: String,
      required: true,
      unique: true
    },
    ioName: {
      type: String,
      required: true
    },
    responsible: {
      type: String
    },
    costCenter: {
      type: String
    },
    costCenterNo: {
      type: String,
      unique: true
    },
    company: {
      type: String
    },
    status: {
      type: String
    },
    ioMapping: {
      type: String
    },
    ioNoMappingWithName: {
      type: String
    },
    ioType: {
      type: String
    },
    member: {
      type: String
    },
    testSpending: {
      type: Number
    },
    isTechsprint: {
      type: Boolean,
      default: false
    },
    asset: {
      type: String
    },
    techProgram: {
      type: String
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    collection: 'ios'
  }
);

// Add virtual for requests
IoSchema.virtual('requests', {
  ref: 'Request',
  localField: 'costCenterNo',
  foreignField: 'ioCostCenter'
});

module.exports = mongoose.models.Io || mongoose.model('Io', IoSchema);
