import { connectDB } from '@/lib/db/connect';
import { Message, IMessage } from '@/lib/db/models/Message';
import { Conversation } from '@/lib/db/models/Conversation';
import { aiService, AIMessage, getStepMessages } from './aiService';
import { integrationService } from './integrationService';
import { ProductInstance } from '@/lib/db/models/ProductInstance';

export const messageService = {
  async list(conversationId: string): Promise<IMessage[]> {
    await connectDB();
    return Message.find({ conversationId }).sort({ createdAt: 1 }).lean();
  },

  async send(
    conversationId: string,
    userId: string,
    content: string
  ): Promise<{ messages: IMessage[] }> {
    await connectDB();

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    // Save user message
    const userMessage = await Message.create({
      conversationId,
      role: 'user',
      content,
    });

    // Get enabled integrations for the project
    const integrations = await integrationService.getByProject(
      conversation.projectId.toString()
    );

    // Build step messages based on enabled integrations
    const stepLabels = getStepMessages(integrations);
    const stepMessages: IMessage[] = [];
    for (const label of stepLabels) {
      const step = await Message.create({
        conversationId,
        role: 'step',
        content: label,
      });
      stepMessages.push(step.toObject());
    }

    // Get message history for context (last 10 messages, user+assistant only)
    const history = await Message.find({
      conversationId,
      role: { $in: ['user', 'assistant'] },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const aiMessages: AIMessage[] = history
      .reverse()
      .filter((m) => m._id.toString() !== userMessage._id.toString())
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    aiMessages.push({ role: 'user', content });

    // Get product instance for product type context
    const productInstance = await ProductInstance.findById(
      conversation.productInstanceId
    ).lean();

    // Call AI
    const aiResponse = await aiService.chat(
      aiMessages,
      integrations,
      productInstance?.productType ?? 'ai_sales_assistant'
    );

    // Save assistant message
    const assistantMessage = await Message.create({
      conversationId,
      role: 'assistant',
      content: aiResponse,
    });

    // Auto-title conversation from first user message
    const msgCount = await Message.countDocuments({ conversationId, role: 'user' });
    if (msgCount === 1) {
      const title = content.slice(0, 60) + (content.length > 60 ? '...' : '');
      await Conversation.findByIdAndUpdate(conversationId, { title, updatedAt: new Date() });
    } else {
      await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });
    }

    return {
      messages: [userMessage.toObject(), ...stepMessages, assistantMessage.toObject()],
    };
  },
};
