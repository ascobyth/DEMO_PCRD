const mongoose = require('mongoose');
const { Schema } = mongoose;

// AppTech schema definition
const AppTechSchema = new Schema(
  {
    appTech: {
      type: String,
      required: true
    },
    shortText: {
      type: String,
      required: true
    },
    appTechType: {
      type: String
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
    collection: 'app_techs'
  }
);

// Add virtual for commercial samples
AppTechSchema.virtual('commercialSamples', {
  ref: 'SampleCommercial',
  localField: '_id',
  foreignField: 'appTechId'
});

module.exports = mongoose.models.AppTech || mongoose.model('AppTech', AppTechSchema);
