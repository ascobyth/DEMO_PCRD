const mongoose = require('mongoose');
const { Schema } = mongoose;

// SampleCommercial schema definition
const SampleCommercialSchema = new Schema(
  {
    gradeName: {
      type: String,
      required: true
    },
    application: {
      type: String
    },
    polymerType: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    properties: {
      type: [Schema.Types.Mixed],
      default: []
    },
    appTechId: {
      type: Schema.Types.ObjectId,
      ref: 'AppTech'
    },
    plantReactorId: {
      type: Schema.Types.ObjectId,
      ref: 'PlantReactor'
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    collection: 'sample_commercials'
  }
);

module.exports = mongoose.models.SampleCommercial || mongoose.model('SampleCommercial', SampleCommercialSchema);
