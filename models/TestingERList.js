const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * TestingERList Schema - Database to store equipment reservation information
 * 
 * This schema extends the TestingSampleList with additional fields specific to
 * equipment reservation, including reservation times, slots, and equipment status.
 */
const TestingERListSchema = new Schema(
  {
    // Link to the testing sample
    testingSampleId: {
      type: Schema.Types.ObjectId,
      ref: 'TestingSampleList',
      required: true,
      description: 'Reference to the testing sample'
    },
    
    // Request information (duplicated for quick access)
    requestId: {
      type: Schema.Types.ObjectId,
      ref: 'RequestList',
      required: true,
      description: 'Reference to the request'
    },
    requestNumber: {
      type: String,
      required: true,
      index: true,
      description: 'Request number for reference'
    },
    
    // Equipment information
    equipmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
      description: 'Reference to the equipment being reserved'
    },
    equipmentName: {
      type: String,
      required: true,
      description: 'Name of the equipment (static)'
    },
    
    // Reservation details
    reservationStartTime: {
      type: Date,
      required: true,
      description: 'Start time of the equipment reservation'
    },
    reservationEndTime: {
      type: Date,
      required: true,
      description: 'End time of the equipment reservation'
    },
    reservationDuration: {
      type: Number,
      description: 'Duration of reservation in minutes'
    },
    slotNumber: {
      type: Number,
      description: 'Slot number in the equipment schedule'
    },
    
    // Reservation status
    reservationStatus: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
      required: true,
      description: 'Current status of the reservation'
    },
    
    // Personnel information
    reservedBy: {
      type: String,
      required: true,
      description: 'Person who made the reservation'
    },
    operatedBy: {
      type: String,
      description: 'Person who operated the equipment'
    },
    
    // Remarks
    remarks: {
      type: String,
      description: 'Additional notes about this reservation'
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    collection: 'testing_er_lists'
  }
);

module.exports = mongoose.models.TestingERList || mongoose.model('TestingERList', TestingERListSchema);