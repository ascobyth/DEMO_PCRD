import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  notificationId: string;
  userId: string;
  userEmail: string;
  title: string;
  message: string;
  type: 'status_change' | 'assignment' | 'deadline' | 'completion' | 'approval_required' | 'system_update' | 'urgent' | 'info';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  relatedEntity?: 'request' | 'sample' | 'user' | 'system';
  relatedEntityId?: string;
  requestNumber?: string;
  sampleId?: string;
  isRead: boolean;
  isArchived: boolean;
  actionUrl?: string;
  actionText?: string;
  previousStatus?: string;
  newStatus?: string;
  changedBy?: string;
  changedByEmail?: string;
  createdAt: Date;
  readAt?: Date;
  archivedAt?: Date;
  expiresAt?: Date;
  metadata: Record<string, any>;
  
  // Methods
  markAsRead(): Promise<INotification>;
  archive(): Promise<INotification>;
}

export interface INotificationModel extends mongoose.Model<INotification> {
  createStatusChangeNotification(data: {
    userId: string;
    userEmail: string;
    requestNumber: string;
    sampleId?: string;
    entityType: string;
    entityId: string;
    previousStatus: string;
    newStatus: string;
    changedBy: string;
    changedByEmail: string;
    priority?: string;
  }): Promise<INotification>;
  
  createAssignmentNotification(data: {
    userId: string;
    userEmail: string;
    requestNumber: string;
    sampleId?: string;
    assignmentType: string;
    assignedBy: string;
    assignedByEmail: string;
    priority?: string;
  }): Promise<INotification>;
  
  createDeadlineNotification(data: {
    userId: string;
    userEmail: string;
    requestNumber: string;
    sampleId?: string;
    dueDate: string;
    daysUntilDue: number;
    priority?: string;
  }): Promise<INotification>;
}

const notificationSchema = new Schema<INotification>({
  notificationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
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
  
  type: {
    type: String,
    required: true,
    enum: [
      'status_change',
      'assignment',
      'deadline',
      'completion',
      'approval_required',
      'system_update',
      'urgent',
      'info'
    ],
    default: 'info',
    index: true
  },
  
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  
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
  
  actionUrl: {
    type: String,
    maxlength: 500
  },
  actionText: {
    type: String,
    maxlength: 100
  },
  
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
  
  expiresAt: {
    type: Date,
    index: true
  },
  
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'notifications'
});

// Compound indexes
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

// Instance methods
notificationSchema.methods.markAsRead = function(this: INotification) {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.archive = function(this: INotification) {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

// Static methods
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

export const Notification = (mongoose.models.Notification as INotificationModel) || 
  mongoose.model<INotification, INotificationModel>('Notification', notificationSchema);

export default Notification;