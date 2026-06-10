import NewConversationForm from "./new-conversation-form"

// Force dynamic — base-ui Button with onClick can't be statically prerendered
export const dynamic = "force-dynamic"

export default function NewConversationPage() {
  return <NewConversationForm />
}
