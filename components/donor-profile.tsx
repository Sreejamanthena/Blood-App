"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"

interface DonorProfileProps {
  donorData: any
  profileCompleted: boolean
  onProfileUpdate: () => void
}

export default function DonorProfile({ donorData, profileCompleted, onProfileUpdate }: DonorProfileProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)

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
        createdAt: donorData?.createdAt || new Date(),
        updatedAt: new Date(),
      }

      await setDoc(doc(db, "donordetails", user.uid), profileData)
      setIsEditing(false)
      onProfileUpdate()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isEditing) {
    return (
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-gray-800">Edit Profile</CardTitle>
          <CardDescription className="text-gray-600">Update your donor information</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    Donor Name*
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={donorData?.name || ""}
                    placeholder="Enter your full name"
                    required
                    className="h-11 border-2 border-gray-200 focus:border-red-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-sm font-semibold text-gray-700">
                    Age*
                  </Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min="1"
                    max="100"
                    defaultValue={donorData?.age || ""}
                    placeholder="Enter your age"
                    required
                    className="h-11 border-2 border-gray-200 focus:border-red-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm font-semibold text-gray-700">
                    Weight* (kg)
                  </Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    min="1"
                    step="0.1"
                    defaultValue={donorData?.weight || ""}
                    placeholder="Enter weight in kg"
                    required
                    className="h-11 border-2 border-gray-200 focus:border-red-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                    Phone Number*
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={donorData?.phone || ""}
                    placeholder="Enter your phone number"
                    required
                    className="h-11 border-2 border-gray-200 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-semibold text-gray-700">
                    City*
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={donorData?.city || ""}
                    placeholder="Enter your city"
                    required
                    className="h-11 border-2 border-gray-200 focus:border-red-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-semibold text-gray-700">
                    State*
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    defaultValue={donorData?.state || ""}
                    placeholder="Enter your state"
                    required
                    className="h-11 border-2 border-gray-200 focus:border-red-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-semibold text-gray-700">
                    Country*
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    defaultValue={donorData?.country || ""}
                    placeholder="Enter your country"
                    required
                    className="h-11 border-2 border-gray-200 focus:border-red-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode" className="text-sm font-semibold text-gray-700">
                    Pincode* (6 digits)
                  </Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    type="number"
                    defaultValue={donorData?.pincode || ""}
                    placeholder="Enter 6-digit pincode"
                    required
                    className="h-11 border-2 border-gray-200 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Medical Section */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Medical Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup" className="text-sm font-semibold text-gray-700">
                    Blood Group*
                  </Label>
                  <Select name="bloodGroup" defaultValue={donorData?.bloodGroup || ""} required>
                    <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-red-500">
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
                  <Label htmlFor="lastDonationDate" className="text-sm font-semibold text-gray-700">
                    Last Donation Date
                  </Label>
                  <Input
                    id="lastDonationDate"
                    name="lastDonationDate"
                    type="date"
                    defaultValue={donorData?.lastDonationDate || ""}
                    className="h-11 border-2 border-gray-200 focus:border-red-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="healthCondition" className="text-sm font-semibold text-gray-700">
                    Health Condition*
                  </Label>
                  <Select name="healthCondition" defaultValue={donorData?.healthCondition || ""} required>
                    <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-red-500">
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
                  <Label htmlFor="hemoglobin" className="text-sm font-semibold text-gray-700">
                    Hemoglobin Level (g/dL) - Optional
                  </Label>
                  <Input
                    id="hemoglobin"
                    name="hemoglobin"
                    type="number"
                    step="0.1"
                    min="0"
                    defaultValue={donorData?.hemoglobin || ""}
                    placeholder="Enter hemoglobin level"
                    className="h-11 border-2 border-gray-200 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-3">
              <Button
                type="submit"
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold px-6"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="border-2 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="bg-emerald-50 border-b rounded-t-lg">
  <CardTitle className="text-xl font-bold text-gray-800">Your Profile</CardTitle>
  <CardDescription className="text-gray-600">Your donor information</CardDescription>
</CardHeader>
      <CardContent className="p-6">
        {/* Eligibility Status */}
       {donorData?.eligible === false && (
  <Alert variant="destructive" className="mb-6 border-red-300 bg-red-100">
    <AlertDescription className="text-red-800">
      <strong>❌ Not Eligible for Donation</strong>
      <br />
      Reasons: {donorData.eligibilityReasons?.join(", ")}
      <br />
      <em>You can update your profile to become eligible and appear in hospital searches.</em>
    </AlertDescription>
  </Alert>
)}

{donorData?.eligible === true && (
  <Alert className="mb-6 border-green-300 bg-green-100">
    <AlertDescription className="text-green-900">
      <strong>✅ Eligible for Blood Donation</strong>
      <br />
      You meet all requirements and are available for hospital requests.
    </AlertDescription>
  </Alert>
)}

{donorData && donorData.eligible === undefined && (
  <Alert variant="destructive" className="mb-6 border-red-300 bg-red-100">
    <AlertDescription className="text-red-800">
      <strong>❌ Not Eligible for Donation</strong>
      <br />
      Please complete your profile with all required information to check eligibility.
    </AlertDescription>
  </Alert>
)}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <Label className="text-sm font-semibold text-gray-600">Name</Label>
              <p className="text-lg font-bold text-gray-800">{donorData?.name}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <Label className="text-sm font-semibold text-gray-600">Age</Label>
              <p className="text-lg font-bold text-gray-800">{donorData?.age} years</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <Label className="text-sm font-semibold text-gray-600">Weight</Label>
              <p className="text-lg font-bold text-gray-800">{donorData?.weight} kg</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <Label className="text-sm font-semibold text-gray-600">Phone</Label>
              <p className="text-lg font-bold text-gray-800">{donorData?.phone}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <Label className="text-sm font-semibold text-gray-600">Location</Label>
              <p className="text-lg font-bold text-gray-800">
                {[donorData?.city, donorData?.state, donorData?.country].filter(Boolean).join(", ")}
                {donorData?.pincode && ` - ${donorData.pincode}`}
              </p>
            </div>
            <div className="p-4 rounded-xl">
  <Label className="text-sm font-semibold text-gray-600">Blood Group</Label>
  <p className="text-2xl font-bold text-red-600">{donorData?.bloodGroup}</p>
</div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <Label className="text-sm font-semibold text-gray-600">Health Condition</Label>
              <p className="text-lg font-bold text-gray-800">{donorData?.healthCondition}</p>
            </div>
            {donorData?.hemoglobin && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <Label className="text-sm font-semibold text-gray-600">Hemoglobin</Label>
                <p className="text-lg font-bold text-gray-800">{donorData.hemoglobin} g/dL</p>
              </div>
            )}
          </div>
        </div>

        {donorData?.lastDonationDate && (
          <div className="mt-4 p-4 rounded-xl">
  <Label className="text-sm font-semibold text-gray-600">Last Donation</Label>
  <p className="text-lg font-bold">
    {new Date(donorData.lastDonationDate).toLocaleDateString()}
  </p>
</div>

        )}

        <div className="mt-6">
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold px-6"
          >
            Edit Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
