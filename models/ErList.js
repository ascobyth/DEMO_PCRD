const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * ErList Schema - Master database to keep list of equipment reservation requests
 *
 * This schema stores all equipment reservation request information including status,
 * equipment details, and reservation data.
 */
const ErListSchema = new Schema(
  {
    // Core request identification
    requestNumber: {
      type: String,
      required: [true, 'Request number is required'],
      unique: true,
      trim: true,
      index: true
    },

    // Request status tracking
    requestStatus: {
      type: String,
      enum: ['draft', 'submitted', 'in-progress', 'completed', 'rejected', 'terminated', 'cancelled'],
      default: 'draft',
      required: true,
      index: true
    },

    // Request details
    requestTitle: {
      type: String,
      required: [true, 'Request title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },

    // Cost information
    useIoNumber: {
      type: Boolean,
      default: false,
      description: 'Whether to use IO number for this request'
    },
    ioCostCenter: {
      type: String,
      ref: 'Io',
      description: 'IO number reference for cost tracking'
    },
    requesterCostCenter: {
      type: String,
      description: 'Requester cost center if not using IO number'
    },

    // Priority settings
    priority: {
      type: String,
      enum: ['normal', 'urgent'],
      default: 'normal',
      required: true
    },
    urgentType: {
      type: String,
      description: 'Type of urgency if priority is urgent'
    },
    urgencyReason: {
      type: String,
      description: 'Justification for urgent request'
    },

    // Equipment information (stored as JSON string)
    jsonEquipmentList: {
      type: String,
      description: 'JSON string containing equipment reservation information'
    },
    
    // Reservation details
    reservationStartDate: {
      type: Date,
      description: 'Start date of equipment reservation period'
    },
    reservationEndDate: {
      type: Date,
      description: 'End date of equipment reservation period'
    },

    // Document uploads
    urgentRequestDocument: {
      type: String,
      description: 'Path to uploaded urgent request memo (PDF/Word, max 10MB)'
    },

    // Requester information
    requesterName: {
      type: String,
      required: true,
      description: 'Name of the person making the request'
    },
    requesterEmail: {
      type: String,
      required: true,
      ref: 'User',
      description: 'Email of the requester'
    },

    // On behalf information
    isOnBehalf: {
      type: Boolean,
      default: false,
      description: 'Whether this request is made on behalf of another person'
    },
    onBehalfOfName: {
      type: String,
      description: 'Name of the person on whose behalf the request is made'
    },
    onBehalfOfEmail: {
      type: String,
      description: 'Email of the person on whose behalf the request is made'
    },
    onBehalfOfCostCenter: {
      type: String,
      description: 'Cost center of the person on whose behalf the request is made'
    },

    // Support staff
    supportStaff: {
      type: String,
      description: 'Person from User database who supports this project'
    },

    // Important dates
    completeDate: {
      type: Date,
      description: 'Date when this request was completed'
    },
    terminateDate: {
      type: Date,
      description: 'Date when this request was terminated'
    },
    cancelDate: {
      type: Date,
      description: 'Date when this request was cancelled'
    },

    // ASR project reference
    asrId: {
      type: String,
      description: 'Reference to ASR project if this is a sub-request'
    },
    isAsrRequest: {
      type: Boolean,
      default: false,
      description: 'Whether this request is part of an ASR project'
    },

    // Additional notes
    notes: {
      type: String,
      description: 'Additional notes or requirements for the reservation'
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    collection: 'er_lists'
  }
);

// Clear the model from cache if it exists to ensure schema updates are applied
if (mongoose.models.ErList) {
  delete mongoose.models.ErList;
}

module.exports = mongoose.model('ErList', ErListSchema);