import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { canSendMessage } from '@/lib/access/rules';
import { conversationService } from '@/lib/services/conversationService';
import { messageService } from '@/lib/services/messageService';
import { SendMessageSchema } from '@/lib/zod/schemas';

export async function POST(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = SendMessageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const conversation = await conversationService.getById(conversationId);
  if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

  if (!canSendMessage(session.user.id, conversation.userId.toString(), conversation.projectId.toString(), session.user.memberships)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const result = await messageService.send(conversationId, session.user.id, parsed.data.content);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error('Message send error:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}