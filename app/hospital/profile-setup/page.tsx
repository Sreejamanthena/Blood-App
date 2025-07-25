"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2 } from "lucide-react"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"

export default function HospitalProfileSetup() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const pincode = Number.parseInt(formData.get("pincode") as string)

    if (isNaN(pincode) || pincode.toString().length !== 6) {
      setError("Pincode must be a valid 6-digit number")
      setIsLoading(false)
      return
    }

    try {
      const profileData = {
        hospitalName: formData.get("hospitalName") as string,
        phone: formData.get("phone") as string,
        email: user.email, // Fetch email from authenticated user
        address: formData.get("address") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        country: formData.get("country") as string,
        pincode,
        description: formData.get("description") as string,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await setDoc(doc(db, "extradetails", user.uid), profileData)

      // Update hospital profile completion status
      await setDoc(
        doc(db, "hospital", user.uid),
        {
          email: user.email,
          profileCompleted: true,
          createdAt: new Date(),
        },
        { merge: true },
      )

      router.push("/hospital/dashboard")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Setup Hospital Profile</CardTitle>
            <CardDescription>Complete your hospital information to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">Hospital Name*</Label>
                  <Input id="hospitalName" name="hospitalName" placeholder="Enter hospital name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number*</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="Enter phone number" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City*</Label>
                  <Input id="city" name="city" placeholder="Enter city" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State*</Label>
                  <Input id="state" name="state" placeholder="Enter state" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country*</Label>
                  <Input id="country" name="country" placeholder="Enter country" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode* (6 digits)</Label>
                  <Input id="pincode" name="pincode" type="number" placeholder="Enter 6-digit pincode" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Hospital Address*</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Enter complete hospital address"
                  required
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Hospital Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief description about the hospital"
                  className="min-h-[80px]"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Setting up Profile..." : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
