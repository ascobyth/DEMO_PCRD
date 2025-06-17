const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Notification identification
  notificationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Target user information
  userId: {
    type: String,
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  
  // Notification content
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Notification type for categorization and styling
  type: {
    type: String,
    required: true,
    enum: [
      'status_change',      // Request or sample status changed
      'assignment',         // New assignment or responsibility
      'deadline',           // Approaching deadline or overdue
      'completion',         // Task or request completed
      'approval_required',  // Action requires approval
      'system_update',      // System maintenance or updates
      'urgent',             // Urgent requests or issues
      'info'               // General information
    ],
    default: 'info',
    index: true
  },
  
  // Priority level
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  
  // Related entity information
  relatedEntity: {
    type: String,
    enum: ['request', 'sample', 'user', 'system'],
    index: true
  },
  relatedEntityId: {
    type: String,
    index: true
  },
  requestNumber: {
    type: String,
    index: true
  },
  sampleId: {
    type: String,
    index: true
  },
  
  // Status tracking
  isRead: {
    type: Boolean,
    required: true,
    default: false,
    index: true
  },
  isArchived: {
    type: Boolean,
    required: true,
    default: false,
    index: true
  },
  
  // Action information
  actionUrl: {
    type: String,
    maxlength: 500
  },
  actionText: {
    type: String,
    maxlength: 100
  },
  
  // Change tracking for status changes
  previousStatus: {
    type: String
  },
  newStatus: {
    type: String
  },
  changedBy: {
    type: String
  },
  changedByEmail: {
    type: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  readAt: {
    type: Date,
    index: true
  },
  archivedAt: {
    type: Date,
    index: true
  },
  
  // Auto-expire for old notifications (optional)
  expiresAt: {
    type: Date,
    index: true
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'notifications'
});

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userEmail: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ requestNumber: 1, createdAt: -1 });
notificationSchema.index({ relatedEntity: 1, relatedEntityId: 1 });

// Auto-generate notification ID
notificationSchema.pre('save', function(next) {
  if (!this.notificationId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.notificationId = `NOTIF_${timestamp}_${random}`.toUpperCase();
  }
  next();
});

// Mark as read method
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Archive notification method
notificationSchema.methods.archive = function() {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

// Static method to create status change notification
notificationSchema.statics.createStatusChangeNotification = async function(data) {
  const {
    userId,
    userEmail,
    requestNumber,
    sampleId,
    entityType,
    entityId,
    previousStatus,
    newStatus,
    changedBy,
    changedByEmail,
    priority = 'medium'
  } = data;
  
  const title = sampleId 
    ? `Sample Status Updated: ${requestNumber}`
    : `Request Status Updated: ${requestNumber}`;
    
  const message = sampleId
    ? `Sample ${sampleId} status changed from "${previousStatus}" to "${newStatus}" by ${changedBy}`
    : `Request ${requestNumber} status changed from "${previousStatus}" to "${newStatus}" by ${changedBy}`;
    
  const actionUrl = sampleId
    ? `/request-management?tab=testing&search=${requestNumber}`
    : `/request-management?search=${requestNumber}`;
    
  return this.create({
    userId,
    userEmail,
    title,
    message,
    type: 'status_change',
    priority,
    relatedEntity: entityType,
    relatedEntityId: entityId,
    requestNumber,
    sampleId,
    previousStatus,
    newStatus,
    changedBy,
    changedByEmail,
    actionUrl,
    actionText: 'View Details'
  });
};

// Static method to create assignment notification
notificationSchema.statics.createAssignmentNotification = async function(data) {
  const {
    userId,
    userEmail,
    requestNumber,
    sampleId,
    assignmentType,
    assignedBy,
    assignedByEmail,
    priority = 'medium'
  } = data;
  
  const title = sampleId
    ? `New Sample Assignment: ${requestNumber}`
    : `New Request Assignment: ${requestNumber}`;
    
  const message = sampleId
    ? `You have been assigned to handle sample ${sampleId} for request ${requestNumber} by ${assignedBy}`
    : `You have been assigned to handle request ${requestNumber} by ${assignedBy}`;
    
  const actionUrl = sampleId
    ? `/request-management?tab=testing&search=${requestNumber}`
    : `/request-management?search=${requestNumber}`;
    
  return this.create({
    userId,
    userEmail,
    title,
    message,
    type: 'assignment',
    priority,
    relatedEntity: sampleId ? 'sample' : 'request',
    relatedEntityId: sampleId || requestNumber,
    requestNumber,
    sampleId,
    changedBy: assignedBy,
    changedByEmail: assignedByEmail,
    actionUrl,
    actionText: 'View Assignment'
  });
};

// Static method to create deadline notification
notificationSchema.statics.createDeadlineNotification = async function(data) {
  const {
    userId,
    userEmail,
    requestNumber,
    sampleId,
    dueDate,
    daysUntilDue,
    priority = 'high'
  } = data;
  
  const isOverdue = daysUntilDue < 0;
  const title = isOverdue
    ? `Overdue: ${requestNumber}`
    : `Deadline Approaching: ${requestNumber}`;
    
  const message = isOverdue
    ? `Request ${requestNumber} is ${Math.abs(daysUntilDue)} days overdue (due: ${dueDate})`
    : `Request ${requestNumber} is due in ${daysUntilDue} days (due: ${dueDate})`;
    
  const actionUrl = sampleId
    ? `/request-management?tab=testing&search=${requestNumber}`
    : `/request-management?search=${requestNumber}`;
    
  return this.create({
    userId,
    userEmail,
    title,
    message,
    type: 'deadline',
    priority: isOverdue ? 'urgent' : priority,
    relatedEntity: sampleId ? 'sample' : 'request',
    relatedEntityId: sampleId || requestNumber,
    requestNumber,
    sampleId,
    actionUrl,
    actionText: 'View Request',
    metadata: {
      dueDate,
      daysUntilDue,
      isOverdue
    }
  });
};

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

module.exports = Notification;