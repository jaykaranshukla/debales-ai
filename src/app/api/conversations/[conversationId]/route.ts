import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { canAccessConversation } from '@/lib/access/rules';
import { conversationService } from '@/lib/services/conversationService';
import { messageService } from '@/lib/services/messageService';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const conversation = await conversationService.getById(conversationId);
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (!canAccessConversation(session.user.id, conversation.userId.toString(), conversation.projectId.toString(), session.user.memberships)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const messages = await messageService.list(conversationId);
  return NextResponse.json({ conversation, messages });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const conversation = await conversationService.getById(conversationId);
  if (!conversation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (session.user.id !== conversation.userId.toString()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await conversationService.delete(conversationId);
  return NextResponse.json({ success: true });
}