const mongoose = require('mongoose');
const { Schema } = mongoose;

// TestingMethod schema definition
const TestingMethodSchema = new Schema(
  {
    methodCode: {
      type: String,
      required: true,
      unique: true
    },
    testingName: {
      type: String,
      required: true
    },
    detailTh: {
      type: String
    },
    detailEng: {
      type: String
    },
    keyResult: {
      type: String
    },
    price: {
      type: Schema.Types.Mixed  // Allow both String and Number
    },
    unit: {
      type: String
    },
    sampleAmount: {
      type: Number
    },
    descriptionImg: {
      type: String
    },
    keyResultImg: {
      type: String
    },
    // Add a new field to store image paths in a structured way
    images: {
      description: {
        type: String
      },
      keyResult: {
        type: String
      }
    },
    workingHour: {
      type: Number
    },
    othersRemark: {
      type: String
    },
    methodStatus: {
      type: String,
      default: 'Active'
    },
    resultAnalysisTime: {
      type: Number
    },
    analysisLeadtime: {
      type: Number
    },
    serviceType: {
      type: [String],
      default: []
    },
    testingTime: {
      type: Number
    },
    noSamplePerYear: {
      type: Number
    },
    methodAsset: {
      type: String
    },
    methodFoh: {
      type: String
    },
    priceEffectiveDate: {
      type: Date
    },
    priorityPrice: {
      type: Schema.Types.Mixed  // Allow both String and Number
    },
    priceNote: {
      type: String
    },
    managable: {
      type: String,
      default: 'Yes'
    },
    erSlotTime: {
      type: Number
    },
    erPerSlot: {
      type: String
    },
    equipmentName: {
      type: String
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location'
    },
    capabilityId: {
      type: Schema.Types.ObjectId,
      ref: 'Capability'
    },
    equipmentId: {
      type: Number
    },
    methodType: {
      type: String
    },
    erTimeStart: {
      type: Number
    },
    erTimeEnd: {
      type: Number
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    collection: 'testing_methods'
  }
);

// Add a virtual for methodcode that maps to methodCode
TestingMethodSchema.virtual('methodcode').get(function() {
  return this.methodCode;
}).set(function(value) {
  this.methodCode = value;
});

// Ensure virtuals are included in JSON output
TestingMethodSchema.set('toJSON', { virtuals: true });
TestingMethodSchema.set('toObject', { virtuals: true });

// Clear the model from cache if it exists to ensure schema updates are applied
if (mongoose.models.TestingMethod) {
  delete mongoose.models.TestingMethod;
}

module.exports = mongoose.model('TestingMethod', TestingMethodSchema);
