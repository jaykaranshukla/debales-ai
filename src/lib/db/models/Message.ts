import mongoose, { Document, Schema, Model } from 'mongoose';

export type MessageRole = 'user' | 'assistant' | 'step';

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    role: { type: String, enum: ['user', 'assistant', 'step'], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const Message: Model<IMessage> =
  mongoose.models.Message ?? mongoose.model<IMessage>('Message', MessageSchema);
