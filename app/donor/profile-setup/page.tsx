"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart } from "lucide-react"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function DonorProfileSetup() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  const healthConditions = ["Generally Healthy", "Minor Illness", "Chronic Condition on Medication", "Recent Surgery"]

  const checkEligibility = (formData: FormData, lastDonationDate: string) => {
    const age = Number.parseInt(formData.get("age") as string)
    const weight = Number.parseFloat(formData.get("weight") as string)
    const healthCondition = formData.get("healthCondition") as string

    let isEligible = true
    const reasons = []

    // Check age (18-65)
    if (age < 18 || age > 65) {
      isEligible = false
      reasons.push("Age must be between 18-65 years")
    }

    // Check weight (≥50kg)
    if (weight < 50) {
      isEligible = false
      reasons.push("Weight must be at least 50kg")
    }

    // Check health condition
    if (!["Generally Healthy", "Minor Illness"].includes(healthCondition)) {
      isEligible = false
      reasons.push("Health condition not suitable for donation")
    }

    // Check last donation date (≥90 days ago)
    if (lastDonationDate) {
      const lastDonation = new Date(lastDonationDate)
      const daysDiff = (new Date().getTime() - lastDonation.getTime()) / (1000 * 3600 * 24)
      if (daysDiff < 90) {
        isEligible = false
        reasons.push("Last donation must be at least 90 days ago")
      }
    }

    return { isEligible, reasons }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const age = Number.parseInt(formData.get("age") as string)
    const weight = Number.parseFloat(formData.get("weight") as string)
    const pincode = Number.parseInt(formData.get("pincode") as string)
    const lastDonationDate = formData.get("lastDonationDate") as string

    // Validation for required fields
    if (isNaN(pincode) || pincode.toString().length !== 6) {
      setError("Pincode must be a valid 6-digit number")
      setIsLoading(false)
      return
    }

    // Check eligibility but allow profile completion
    const { isEligible, reasons } = checkEligibility(formData, lastDonationDate)

    try {
      const profileData = {
        name: formData.get("name") as string,
        age,
        weight,
        phone: formData.get("phone") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        country: formData.get("country") as string,
        pincode,
        lastDonationDate: lastDonationDate || null,
        bloodGroup: formData.get("bloodGroup") as string,
        healthCondition: formData.get("healthCondition") as string,
        hemoglobin: formData.get("hemoglobin") ? Number.parseFloat(formData.get("hemoglobin") as string) : null,
        available: isEligible, // Only eligible donors are available for hospital search
        eligible: isEligible,
        eligibilityReasons: reasons,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await setDoc(doc(db, "donordetails", user.uid), profileData)

      // Update donor profile completion status
      await setDoc(
        doc(db, "donors", user.uid),
        {
          email: user.email,
          profileCompleted: true,
          createdAt: new Date(),
        },
        { merge: true },
      )

      router.push("/donor/dashboard")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Complete Your Donor Profile</CardTitle>
            <CardDescription>Please fill in all the required information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Donor Name*</Label>
                    <Input id="name" name="name" placeholder="Enter your full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age*</Label>
                    <Input id="age" name="age" type="number" min="1" max="100" placeholder="Enter your age" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight* (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      min="1"
                      step="0.1"
                      placeholder="Enter weight in kg"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number*</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="Enter your phone number" required />
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City*</Label>
                    <Input id="city" name="city" placeholder="Enter your city" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State*</Label>
                    <Input id="state" name="state" placeholder="Enter your state" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country*</Label>
                    <Input id="country" name="country" placeholder="Enter your country" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode* (6 digits)</Label>
                    <Input id="pincode" name="pincode" type="number" placeholder="Enter 6-digit pincode" required />
                  </div>
                </div>
              </div>

              {/* Medical Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Medical Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group*</Label>
                    <Select name="bloodGroup" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodGroups.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastDonationDate">Last Donation Date</Label>
                    <Input id="lastDonationDate" name="lastDonationDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="healthCondition">Health Condition*</Label>
                    <Select name="healthCondition" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select health condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {healthConditions.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hemoglobin">Hemoglobin Level (g/dL) - Optional</Label>
                    <Input
                      id="hemoglobin"
                      name="hemoglobin"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Enter hemoglobin level"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                {isLoading ? "Saving Profile..." : "Complete Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
