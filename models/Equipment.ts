import mongoose, { Schema, Document } from 'mongoose';

// Define the Equipment interface
export interface IEquipment extends Document {
  name: string;
  description: string;
  model: string;
  manufacturer: string;
  location: string;
  status: 'Active' | 'Maintenance' | 'Inactive';
  serviceCapacity: {
    daysPerWeek: number;
    actualDaysPerWeek: number;
    startTime: number;
    endTime: number;
    capacityPerDay: number;
    normalDuration: number;
    erDuration: number;
    workloadFactor: number;
    workloadDescription: string;
  };
  responsibleUsers: string[];
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Create the Equipment schema
const EquipmentSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    model: {
      type: String,
      required: [true, 'Please provide a model'],
    },
    manufacturer: {
      type: String,
      required: [true, 'Please provide a manufacturer'],
    },
    location: {
      type: String,
      required: [true, 'Please provide a location'],
    },
    status: {
      type: String,
      enum: ['Active', 'Maintenance', 'Inactive'],
      default: 'Active',
    },
    serviceCapacity: {
      daysPerWeek: {
        type: Number,
        default: 5,
      },
      actualDaysPerWeek: {
        type: Number,
        default: 5,
      },
      startTime: {
        type: Number,
        default: 900, // 9:00 AM
      },
      endTime: {
        type: Number,
        default: 1700, // 5:00 PM
      },
      capacityPerDay: {
        type: Number,
        default: 4,
      },
      normalDuration: {
        type: Number,
        default: 60, // 60 minutes
      },
      erDuration: {
        type: Number,
        default: 120, // 120 minutes
      },
      workloadFactor: {
        type: Number,
        default: 0.8,
      },
      workloadDescription: {
        type: String,
        default: '',
      },
    },
    responsibleUsers: [{
      type: String,
      ref: 'User',
    }],
    documents: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Create and export the Equipment model
export default mongoose.models.Equipment || mongoose.model<IEquipment>('Equipment', EquipmentSchema);
