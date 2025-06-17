import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAsrList extends Document {
  asrNumber: string;
  asrName: string;
  asrType: 'project' | 'data-analysis';
  asrStatus: 'draft' | 'submitted' | 'in-progress' | 'completed' | 'rejected' | 'terminated' | 'cancelled';
  asrDetail?: string;
  requesterName: string;
  requesterEmail: string;
  asrRequireDate?: Date;
  asrEstCompletedDate?: Date;
  completedDate?: Date;
  approveDate?: Date;
  sampleReceiveDate?: Date;
  addMemberDate?: Date;
  asrMethodology?: string;
  capabilityId?: Types.ObjectId;
  asrSampleList?: string;
  problemSource?: 'customer' | 'production' | 'development' | 'research' | 'quality' | 'other';
  expectedResults?: string;
  businessImpact?: string;
  priority?: 'normal' | 'urgent';
  urgencyType?: 'customer_complaint' | 'production_stop' | 'urgent_development' | 'management_request' | 'quality_issue' | 'other';
  urgencyReason?: string;
  approver?: string;
  urgentMemoPath?: string;
  additionalNotes?: string;
  attachmentPaths?: string[];
  asrOwnerName?: string;
  asrOwnerEmail?: string;
  useIoNumber?: boolean;
  ioCostCenter?: string;
  requesterCostCenter?: string;
  isOnBehalf?: boolean;
  onBehalfInformation?: {
    name?: string;
    email?: string;
    costCenter?: string;
  };
  asrEvaluationScore?: string;
  asrLink?: string;
  asrPpcMemberList?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AsrListSchema = new Schema<IAsrList>(
  {
    asrNumber: { type: String, required: true, unique: true, trim: true, index: true },
    asrName: { type: String, required: true, trim: true },
    asrType: { type: String, enum: ['project', 'data-analysis'], required: true },
    asrStatus: {
      type: String,
      enum: ['draft', 'submitted', 'in-progress', 'completed', 'rejected', 'terminated', 'cancelled'],
      default: 'draft',
      required: true,
      index: true,
    },
    asrDetail: { type: String },
    requesterName: { type: String, required: true },
    requesterEmail: { type: String, required: true, ref: 'User' },
    asrRequireDate: { type: Date },
    asrEstCompletedDate: { type: Date },
    completedDate: { type: Date },
    approveDate: { type: Date },
    sampleReceiveDate: { type: Date },
    addMemberDate: { type: Date },
    asrMethodology: { type: String },
    capabilityId: { type: Schema.Types.ObjectId, ref: 'Capability' },
    asrSampleList: { type: String },
    problemSource: { 
      type: String, 
      enum: ['customer', 'production', 'development', 'research', 'quality', 'other'] 
    },
    expectedResults: { type: String },
    businessImpact: { type: String },
    priority: { 
      type: String, 
      enum: ['normal', 'urgent'], 
      default: 'normal' 
    },
    urgencyType: { 
      type: String, 
      enum: ['customer_complaint', 'production_stop', 'urgent_development', 'management_request', 'quality_issue', 'other'] 
    },
    urgencyReason: { type: String },
    approver: { type: String },
    urgentMemoPath: { type: String },
    additionalNotes: { type: String },
    attachmentPaths: { type: [String], default: [] },
    asrOwnerName: { type: String },
    asrOwnerEmail: { type: String },
    useIoNumber: { type: Boolean, default: false },
    ioCostCenter: { type: String, ref: 'Io' },
    requesterCostCenter: { type: String },
    isOnBehalf: { type: Boolean, default: false },
    onBehalfInformation: {
      name: { type: String },
      email: { type: String },
      costCenter: { type: String },
    },
    asrEvaluationScore: { type: String },
    asrLink: { type: String },
    asrPpcMemberList: { type: String },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    collection: 'asr_lists',
  }
);

AsrListSchema.virtual('requests', {
  ref: 'RequestList',
  localField: 'asrNumber',
  foreignField: 'asrId',
});

export default mongoose.models.AsrList || mongoose.model<IAsrList>('AsrList', AsrListSchema);
