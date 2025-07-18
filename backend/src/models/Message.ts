import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  content: string;
  sender: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  messageType: 'text' | 'image' | 'file';
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
messageSchema.index({ group: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
