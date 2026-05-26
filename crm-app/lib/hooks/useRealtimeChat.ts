'use client'
import { useEffect, useRef, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/auth-client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface ChatMessage {
  id:           string
  sessionId:    string
  content:      string
  isFromVisitor: boolean
  visitorName?: string | null
  userId?:      string | null
  createdAt:    string
  readAt?:      string | null
}

interface WebchatMessageRow {
  id:              string
  session_id:      string
  content:         string
  is_from_visitor: boolean
  visitor_name?:   string | null
  user_id?:        string | null
  created_at:      string
  read_at?:        string | null
}

function mapRow(row: WebchatMessageRow): ChatMessage {
  return {
    id:            row.id,
    sessionId:     row.session_id,
    content:       row.content,
    isFromVisitor: row.is_from_visitor,
    visitorName:   row.visitor_name ?? null,
    userId:        row.user_id ?? null,
    createdAt:     row.created_at,
    readAt:        row.read_at ?? null,
  }
}

export function useRealtimeChat(sessionId: string | null, sessionToken?: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connected, setConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!sessionId) return

    const supabase = getSupabaseBrowserClient()

    supabase
      .from('webchat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages((data as WebchatMessageRow[]).map(mapRow))
      })

    const channel = supabase
      .channel(`webchat:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'webchat_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const row = payload.new as WebchatMessageRow
          setMessages((prev) =>
            prev.some((m) => m.id === row.id) ? prev : [...prev, mapRow(row)],
          )
        },
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  const sendMessage = async (content: string, isFromVisitor: boolean) => {
    if (!sessionId) return
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (isFromVisitor && sessionToken) {
      headers['X-Session-Token'] = sessionToken
    }
    const res = await fetch('/api/v1/webchat/messages', {
      method:  'POST',
      headers,
      body:    JSON.stringify({ sessionId, content, isFromVisitor }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null) as { error?: string } | null
      throw new Error(body?.error ?? 'Falha ao enviar mensagem')
    }
    const body = await res.json() as { data: WebchatMessageRow }
    setMessages((prev) =>
      prev.some((m) => m.id === body.data.id) ? prev : [...prev, mapRow(body.data)],
    )
  }

  return { messages, connected, sendMessage }
}
