"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"

export default function HospitalAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      // Verify user is a hospital by checking if they exist in hospital collection
      const hospitalDoc = await getDoc(doc(db, "hospital", userCredential.user.uid))
      if (!hospitalDoc.exists()) {
        setError("This account is not registered as a hospital. Please contact administrator.")
        setIsLoading(false)
        return
      }

      // Redirect directly to dashboard - no profile setup needed
      router.push("/hospital/dashboard")
    } catch (error: any) {
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        setError("Invalid email or password. Please check your credentials.")
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.")
      } else {
        setError("Sign in failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-sky-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2 text-slate-600 hover:text-sky-600 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        <Card className="shadow-lg border-slate-200 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-700 bg-clip-text text-transparent">
              Hospital Portal
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 mt-2">
              Sign in with your hospital credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                  Hospital Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your hospital email"
                  required
                  className="h-11 border-2 border-slate-200 focus:border-sky-500 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="h-11 border-2 border-slate-200 focus:border-sky-500 transition-colors"
                />
              </div>
              {error && (
                <Alert variant="destructive" className="border-rose-200 bg-rose-50">
                  <AlertDescription className="text-rose-700">{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner size="sm" text="" /> : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-sky-50 rounded-lg border border-sky-200">
              <p className="text-sm text-sky-700 text-center">
                <strong>Note:</strong> Hospital accounts are managed by administrators. Contact support if you need
                access credentials.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
