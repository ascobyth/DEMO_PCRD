const mongoose = require('mongoose');
const { Schema } = mongoose;

// TestingSample schema definition
const TestingSampleSchema = new Schema(
  {
    testingListId: {
      type: String,
      required: true,
      unique: true
    },
    sampleId: {
      type: String,
      required: true
    },
    testingId: {
      type: String,
      required: true
    },
    sampleName: {
      type: String,
      required: true
    },
    sysSampleName: {
      type: String
    },
    fullSampleName: {
      type: String
    },
    remark: {
      type: String
    },
    testingRemark: {
      type: String
    },
    testingCost: {
      type: String
    },
    sampleStatus: {
      type: String,
      required: true
    },
    submitDate: {
      type: Date
    },
    receiveDate: {
      type: Date
    },
    operationCompleteDate: {
      type: Date
    },
    entryResultDate: {
      type: Date
    },
    approveDate: {
      type: Date
    },
    requestCompleteDate: {
      type: Date
    },
    dueDate: {
      type: Date
    },
    startReserveTime: {
      type: Date
    },
    endReserveTime: {
      type: Date
    },
    checkAC: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    collection: 'testing_samples'
  }
);

module.exports = mongoose.models.TestingSample || mongoose.model('TestingSample', TestingSampleSchema);
