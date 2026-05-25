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

export function useRealtimeChat(sessionId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connected, setConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!sessionId) return

    const supabase = getSupabaseBrowserClient()

    // Carregar histórico inicial
    supabase
      .from('webchat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as ChatMessage[])
      })

    // Subscribir a novas mensagens via Postgres Changes
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
          setMessages(prev => [...prev, payload.new as ChatMessage])
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
    await fetch('/api/v1/webchat/messages', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ sessionId, content, isFromVisitor }),
    })
  }

  return { messages, connected, sendMessage }
}