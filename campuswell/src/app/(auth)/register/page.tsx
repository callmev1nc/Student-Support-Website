import RegisterForm from "./register-form"

// Force dynamic — base-ui Select can't be statically prerendered
export const dynamic = "force-dynamic"

export default function RegisterPage() {
  return <RegisterForm />
}
