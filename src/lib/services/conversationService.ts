import { connectDB } from '@/lib/db/connect';
import { Conversation, IConversation } from '@/lib/db/models/Conversation';
import { Message } from '@/lib/db/models/Message';
import { CreateConversationInput } from '@/lib/zod/schemas';

export const conversationService = {
  async list(projectId: string, userId: string): Promise<IConversation[]> {
    await connectDB();
    return Conversation.find({ projectId, userId })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();
  },

  async getById(id: string): Promise<IConversation | null> {
    await connectDB();
    return Conversation.findById(id).lean();
  },

  async create(
    projectId: string,
    userId: string,
    data: CreateConversationInput
  ): Promise<IConversation> {
    await connectDB();
    const conv = await Conversation.create({
      projectId,
      userId,
      productInstanceId: data.productInstanceId,
      title: data.title ?? 'New Conversation',
    });
    return conv.toObject();
  },

  async updateTitle(id: string, title: string): Promise<void> {
    await connectDB();
    await Conversation.findByIdAndUpdate(id, { title });
  },

  async delete(id: string): Promise<void> {
    await connectDB();
    await Conversation.findByIdAndDelete(id);
    await Message.deleteMany({ conversationId: id });
  },

  async countByProject(projectId: string): Promise<number> {
    await connectDB();
    return Conversation.countDocuments({ projectId });
  },

  async recentByProject(projectId: string, limit = 5) {
    await connectDB();
    return Conversation.find({ projectId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();
  },
};
