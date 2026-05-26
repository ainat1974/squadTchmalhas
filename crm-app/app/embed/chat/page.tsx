import { ChatEmbed } from './ChatEmbed'

interface Props {
  searchParams: Promise<{ session?: string; pageUrl?: string }>
}

export default async function EmbedChatPage({ searchParams }: Props) {
  const { session, pageUrl } = await searchParams

  return <ChatEmbed initialSessionId={session ?? null} pageUrl={pageUrl ?? null} />
}
