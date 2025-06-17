const mongoose = require('mongoose');
const { Schema } = mongoose;

// PlantReactor schema definition
const PlantReactorSchema = new Schema(
  {
    reactorPlantName: {
      type: String,
      required: true
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
    collection: 'plant_reactors'
  }
);

// Add virtual for commercial samples
PlantReactorSchema.virtual('commercialSamples', {
  ref: 'SampleCommercial',
  localField: '_id',
  foreignField: 'plantReactorId'
});

module.exports = mongoose.models.PlantReactor || mongoose.model('PlantReactor', PlantReactorSchema);
