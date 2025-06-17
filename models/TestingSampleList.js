const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * TestingSampleList Schema - Database to keep information of testing of individual request
 *
 * This schema stores detailed information about each testing sample, including
 * equipment used, methods, status, and tracking dates.
 */
const TestingSampleListSchema = new Schema(
  {
    // Request references
    requestId: {
      type: Schema.Types.ObjectId,
      ref: 'RequestList',
      required: true,
      description: 'Reference to the request in RequestList'
    },
    requestNumber: {
      type: String,
      required: true,
      index: true,
      description: 'Request number (static, not reference)'
    },

    // Equipment information
    equipmentName: {
      type: String,
      description: 'Equipment name (static, read from equipment table)'
    },
    equipmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Equipment',
      description: 'Reference to equipment in Equipment table'
    },

    // Sample identification
    sampleId: {
      type: String,
      required: true,
      unique: true,
      description: 'Auto-generated sample ID for system reference'
    },
    sampleName: {
      type: String,
      required: true,
      description: 'Sample name and details (name, form, type, remark, etc.)'
    },
    sysSampleName: {
      type: String,
      description: 'System-generated sample name'
    },
    fullSampleName: {
      type: String,
      description: 'Complete sample name with all details'
    },
    remark: {
      type: String,
      description: 'General remarks about the sample'
    },

    // Testing method information
    methodCode: {
      type: String,
      description: 'Method code (static, read from testing method table)'
    },
    methodId: {
      type: Schema.Types.ObjectId,
      ref: 'TestingMethod',
      description: 'Reference to method ID in TestingMethod table'
    },
    testingRemark: {
      type: String,
      description: 'Remarks specific to the testing process'
    },
    testingCost: {
      type: String,
      description: 'Testing cost read from TestingMethod'
    },

    // Capability information
    capabilityId: {
      type: Schema.Types.ObjectId,
      ref: 'Capability',
      description: 'Reference to capability in Capability table'
    },
    capabilityName: {
      type: String,
      description: 'Name of the capability (static, not reference)'
    },

    // Testing identifiers
    testingListId: {
      type: String,
      required: true,
      unique: true,
      description: 'Auto-generated number for this record'
    },
    testingId: {
      type: String,
      required: true,
      description: 'Auto-generated testing list ID to reference the same test in the request'
    },

    // Priority
    priority: {
      type: String,
      enum: ['normal', 'urgent'],
      default: 'normal',
      required: true,
      description: 'Priority level of the testing sample (inherited from request)'
    },

    // Status tracking
    sampleStatus: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'Pending Receive',
        'in-progress',
        'operation-completed',
        'Pending Entry Results',
        'test-results-completed', 
        'completed',
        'rejected',
        'terminated',
        'cancelled'
      ],
      default: 'draft',
      required: true,
      index: true,
      description: 'Current status of the sample testing'
    },

    // Important dates
    submitDate: {
      type: Date,
      description: 'Date when testing was submitted'
    },
    receiveDate: {
      type: Date,
      description: 'Date when sample was received'
    },
    operationCompleteDate: {
      type: Date,
      description: 'Date when operation was completed'
    },
    entryResultDate: {
      type: Date,
      description: 'Date when results were entered'
    },
    approveDate: {
      type: Date,
      description: 'Date when results were approved'
    },
    requestCompleteDate: {
      type: Date,
      description: 'Date when the entire request was completed'
    },
    dueDate: {
      type: Date,
      description: 'Deadline for completing the testing'
    },

    // Planning dates
    firstDueDate: {
      type: Date,
      description: 'First planned due date (never changes after initial planning)'
    },
    actualDueDate: {
      type: Date,
      description: 'Current planned due date (updates when plan changes)'
    },
    plannedStartTime: {
      type: Date,
      description: 'Planned start time from calendar scheduling'
    },
    plannedEndTime: {
      type: Date,
      description: 'Planned end time from calendar scheduling'
    },
    plannedBy: {
      type: String,
      description: 'Name of the person who planned the schedule'
    },
    plannedByEmail: {
      type: String,
      description: 'Email of the person who planned the schedule'
    },
    plannedAt: {
      type: Date,
      description: 'Timestamp when the schedule was planned'
    },
    firstPlannedAt: {
      type: Date,
      description: 'Timestamp when the schedule was first planned'
    },

    // Request type
    requestType: {
      type: String,
      description: 'Type of request (e.g., NTR)'
    },

    // Personnel tracking
    receiveBy: {
      type: String,
      description: 'Person who received this request'
    },
    operationCompleteBy: {
      type: String,
      description: 'Person who completed the operation'
    },
    entryResultBy: {
      type: String,
      description: 'Person who entered the results'
    },
    requestCompleteBy: {
      type: String,
      description: 'Person who marked the request as complete'
    },

    // Equipment reservation
    startReserveTime: {
      type: Date,
      description: 'Starting time of equipment reservation'
    },
    endReserveTime: {
      type: Date,
      description: 'Ending time of equipment reservation'
    },

    // Additional flags
    // checkAC field removed as per requirements

    // File attachment fields for test results (Legacy - single file)
    attachedFileName: {
      type: String,
      description: 'Original name of the attached test result file'
    },
    attachedFileId: {
      type: String,
      description: 'Unique ID for the attached file'
    },
    attachedFilePath: {
      type: String,
      description: 'Path where the test result file is stored'
    },
    attachedFileSize: {
      type: Number,
      description: 'Size of the attached file in bytes'
    },
    attachedFileType: {
      type: String,
      description: 'MIME type of the attached file'
    },
    attachedFileDate: {
      type: Date,
      description: 'Date when the file was attached'
    },

    // Multiple file attachments
    attachedFiles: [{
      filename: {
        type: String,
        description: 'Original name of the attached test result file'
      },
      fileId: {
        type: String,
        description: 'Unique ID for the attached file'
      },
      filePath: {
        type: String,
        description: 'Path where the test result file is stored'
      },
      fileSize: {
        type: Number,
        description: 'Size of the attached file in bytes'
      },
      fileType: {
        type: String,
        description: 'MIME type of the attached file'
      },
      uploadDate: {
        type: Date,
        description: 'Date when the file was uploaded'
      }
    }],

    // Termination fields
    terminateDate: {
      type: Date,
      description: 'Date when this sample was terminated'
    },
    terminationReason: {
      type: String,
      description: 'Reason for terminating this sample'
    }
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    collection: 'testing_sample_lists'
  }
);

// Create indexes for faster queries
TestingSampleListSchema.index({ requestNumber: 1, sampleId: 1 });
// sampleStatus index is auto-created from field definition
TestingSampleListSchema.index({ methodId: 1 });
TestingSampleListSchema.index({ equipmentId: 1 });

module.exports = mongoose.models.TestingSampleList || mongoose.model('TestingSampleList', TestingSampleListSchema);