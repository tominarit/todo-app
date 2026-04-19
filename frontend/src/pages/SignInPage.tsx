import { SignIn } from '@clerk/react'

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignIn routing="path" path="/sign-in" />
    </div>
  )
};