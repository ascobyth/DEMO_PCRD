const mongoose = require('mongoose');
const { Schema } = mongoose;

// Equipment schema definition
const EquipmentSchema = new Schema(
  {
    equipmentCode: {
      type: String,
      required: true,
      unique: true
    },
    equipmentName: {
      type: String,
      required: true
    },
    equipmentFunction: {
      type: String
    },
    model: {
      type: String
    },
    manufacturer: {
      type: String
    },
    usedDate: {
      type: String
    },
    equipmentCondition: {
      type: String
    },
    typeInEx: {
      type: String
    },
    mainMonitor: {
      type: String
    },
    serviceTime: {
      type: Number
    },
    pmInYear: {
      type: Number
    },
    calInYear: {
      type: Number
    },
    serviceDayPerWeek: {
      type: Number
    },
    aServiceDayPerWeek: {
      type: Number
    },
    workloadFactor: {
      type: Number
    },
    workloadFactorDescription: {
      type: String
    },
    serviceTimeStart: {
      type: Number
    },
    serviceTimeEnd: {
      type: Number
    },
    capPerDay: {
      type: Number
    },
    serviceNormalDuration: {
      type: Number
    },
    serviceErDuration: {
      type: Number
    },
    equipmentScope: {
      type: String
    },
    range: {
      type: String
    },
    accuracy: {
      type: String
    },
    allowance: {
      type: String
    },
    rangeOfUse: {
      type: String
    },
    pmBy: {
      type: String
    },
    pmFreq: {
      type: String
    },
    calBy: {
      type: String
    },
    calFreq: {
      type: String
    },
    distributor: {
      type: String
    },
    location: {
      type: String
    },
    operationDocument: {
      type: String
    },
    respBy: {
      type: String
    },
    respByComplianceAssetId: {
      type: String
    },
    equipmentStatus: {
      type: String
    },
    equipmentType: {
      type: String
    },
    primaryId: {
      type: String
    },
    primaryCode: {
      type: String
    },
    componentId: {
      type: String
    },
    componentCode: {
      type: String
    },
    accessoryId: {
      type: String
    },
    accessoryCode: {
      type: String
    },
    equipmentFunctionAll: {
      type: String
    },
    obsoleteDate: {
      type: String
    },
    remark: {
      type: String
    },
    obsoleteReason: {
      type: String
    },
    targetDuration: {
      type: Number
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'Location'
    },
    equipmentImage: {
      type: String
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    collection: 'equipment'
  }
);

module.exports = mongoose.models.Equipment || mongoose.model('Equipment', EquipmentSchema);
