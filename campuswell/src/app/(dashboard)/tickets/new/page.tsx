import NewTicketForm from "./new-ticket-form"

// Force dynamic — base-ui Select can't be statically prerendered
export const dynamic = "force-dynamic"

export default function NewTicketPage() {
  return <NewTicketForm />
}
