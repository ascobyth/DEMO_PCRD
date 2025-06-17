const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    unique: true,
    required: true,
    description: 'Unique complaint identifier'
  },
  
  // Related request information
  requestNumber: {
    type: String,
    required: true,
    description: 'The request number this complaint is related to'
  },
  requestType: {
    type: String,
    enum: ['NTR', 'ASR', 'ER'],
    required: true,
    description: 'Type of the original request'
  },
  
  // Complaint details
  complaintType: {
    type: String,
    enum: [
      'quality_issue',
      'delay',
      'incorrect_results',
      'sample_damage',
      'communication_issue',
      'cost_dispute',
      'method_concern',
      'other'
    ],
    required: true,
    description: 'Type of complaint'
  },
  complaintDescription: {
    type: String,
    required: true,
    description: 'Detailed description of the complaint'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    description: 'Severity level of the complaint'
  },
  
  // Initial action
  initialAction: {
    type: String,
    enum: [
      're-test',
      'need_discussion',
      'review_method',
      'additional_analysis',
      'refund_requested',
      'escalate_to_manager',
      'provide_clarification',
      'sample_replacement',
      'expedite_process',
      'no_action_needed'
    ],
    required: true,
    description: 'Initial action to be taken'
  },
  actionNotes: {
    type: String,
    description: 'Additional notes about the action to be taken'
  },
  
  // Complainant information
  complainantName: {
    type: String,
    required: true,
    description: 'Name of the person filing the complaint'
  },
  complainantEmail: {
    type: String,
    required: true,
    description: 'Email of the person filing the complaint'
  },
  complainantPhone: {
    type: String,
    description: 'Phone number of the complainant'
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed', 'escalated'],
    default: 'open',
    description: 'Current status of the complaint'
  },
  
  // Assignment and resolution
  assignedTo: {
    type: String,
    description: 'Email of the person assigned to handle this complaint'
  },
  assignedToName: {
    type: String,
    description: 'Name of the person assigned to handle this complaint'
  },
  assignedDate: {
    type: Date,
    description: 'Date when the complaint was assigned'
  },
  
  // Resolution details
  resolutionDescription: {
    type: String,
    description: 'Description of how the complaint was resolved'
  },
  resolutionDate: {
    type: Date,
    description: 'Date when the complaint was resolved'
  },
  customerSatisfaction: {
    type: Number,
    min: 1,
    max: 5,
    description: 'Customer satisfaction rating after resolution (1-5)'
  },
  
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false,
    description: 'Whether follow-up is required'
  },
  followUpDate: {
    type: Date,
    description: 'Date for follow-up'
  },
  followUpNotes: {
    type: String,
    description: 'Notes about follow-up actions'
  },
  
  // Supporting documents
  attachments: [{
    fileName: String,
    filePath: String,
    uploadedAt: Date,
    uploadedBy: String
  }],
  
  // History tracking
  history: [{
    action: String,
    description: String,
    performedBy: String,
    performedByName: String,
    timestamp: Date
  }],
  
  // Additional metadata
  rootCause: {
    type: String,
    description: 'Identified root cause of the complaint'
  },
  preventiveAction: {
    type: String,
    description: 'Preventive action taken to avoid recurrence'
  },
  estimatedResolutionDate: {
    type: Date,
    description: 'Estimated date for resolution'
  },
  actualCost: {
    type: Number,
    description: 'Actual cost incurred due to complaint (if any)'
  },
  
  // Created/Updated tracking
  createdBy: {
    type: String,
    description: 'Email of the person who created this complaint'
  },
  createdByName: {
    type: String,
    description: 'Name of the person who created this complaint'
  }
}, {
  timestamps: true,
  collection: 'complaints'
});

// Add indexes for better query performance
ComplaintSchema.index({ complaintId: 1 });
ComplaintSchema.index({ requestNumber: 1 });
ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ assignedTo: 1 });
ComplaintSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);