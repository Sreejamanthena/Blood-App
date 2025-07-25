"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"

interface HospitalProfileProps {
  hospitalData: any
  onProfileUpdate: () => void
}

export default function HospitalProfile({ hospitalData, onProfileUpdate }: HospitalProfileProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const pincode = Number.parseInt(formData.get("pincode") as string)

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
        updatedAt: new Date(),
      }

      await updateDoc(doc(db, "extradetails", user.uid), profileData)
      setIsEditing(false)
      onProfileUpdate()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Edit Form View
  if (isEditing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Edit Hospital Profile</CardTitle>
          <CardDescription>Update your hospital information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hospitalName">Hospital Name*</Label>
                <Input
                  id="hospitalName"
                  name="hospitalName"
                  defaultValue={hospitalData?.hospitalName || ""}
                  placeholder="Enter hospital name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone*</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={hospitalData?.phone || ""}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City*</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={hospitalData?.city || ""}
                  placeholder="Enter city"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State*</Label>
                <Input
                  id="state"
                  name="state"
                  defaultValue={hospitalData?.state || ""}
                  placeholder="Enter state"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country*</Label>
                <Input
                  id="country"
                  name="country"
                  defaultValue={hospitalData?.country || ""}
                  placeholder="Enter country"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode*</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  type="number"
                  defaultValue={hospitalData?.pincode || ""}
                  placeholder="Enter pincode"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address*</Label>
              <Textarea
                id="address"
                name="address"
                defaultValue={hospitalData?.address || ""}
                placeholder="Enter complete hospital address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={hospitalData?.description || ""}
                placeholder="Brief description about the hospital (optional)"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  // View Mode
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Hospital Profile</CardTitle>
        <CardDescription>Your hospital information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">Hospital Name</Label>
            <p className="text-sm font-semibold">{hospitalData?.hospitalName}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Phone</Label>
            <p className="text-sm">{hospitalData?.phone}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Email</Label>
            <p className="text-sm">{hospitalData?.email || user?.email}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Address</Label>
            <p className="text-sm">{hospitalData?.address}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Location</Label>
            <p className="text-sm">
              {hospitalData?.city}, {hospitalData?.state}, {hospitalData?.country} - {hospitalData?.pincode}
            </p>
          </div>
          {hospitalData?.description && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Description</Label>
              <p className="text-sm">{hospitalData.description}</p>
            </div>
          )}
        </div>
        <div className="mt-6">
          <Button onClick={() => setIsEditing(true)} variant="outline">
            Edit Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
