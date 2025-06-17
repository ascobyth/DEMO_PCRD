import mongoose, { Schema, Document } from 'mongoose';

// Define the user role type
export type UserRole = 'user' | 'admin' | 'lab_manager';

// Define the User interface
export interface IUser extends Document {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  onBehalfAccess?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Create the User schema
const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'lab_manager'],
      default: 'user',
    },
    department: {
      type: String,
      required: [true, 'Please provide a department'],
    },
    onBehalfAccess: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
  },
  {
    timestamps: true,
  }
);

// Create and export the User model
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
