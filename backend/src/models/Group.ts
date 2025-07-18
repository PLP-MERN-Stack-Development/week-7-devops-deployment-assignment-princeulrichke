import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  members: mongoose.Types.ObjectId[];
  admin: mongoose.Types.ObjectId;
  avatar?: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 200,
    default: ''
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  isPrivate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure admin is always in members
groupSchema.pre('save', function(this: IGroup, next: mongoose.CallbackWithoutResultAndOptionalError) {
  if (!this.members.includes(this.admin)) {
    this.members.push(this.admin);
  }
  next();
});

export const Group = mongoose.model<IGroup>('Group', groupSchema);
