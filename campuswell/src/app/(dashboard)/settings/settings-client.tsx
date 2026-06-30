"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTransition } from "react"
import { toast } from "sonner"
import { User, Lock, Save, Bot } from "lucide-react"
import { updateAssistantOptIn } from "@/app/actions/assistant"

export function SettingsClient(props: {
  initialName: string
  initialEmail: string
  initialBio: string
  initialAvatarUrl: string
  initialAssistantOptIn: boolean
}) {
  const [name, setName] = useState(props.initialName)
  const [bio, setBio] = useState(props.initialBio)
  const [avatarUrl, setAvatarUrl] = useState(props.initialAvatarUrl)
  const [saving, setSaving] = useState(false)

  const [assistantOptIn, setAssistantOptIn] = useState(props.initialAssistantOptIn)
  const [optInPending, startOptInTransition] = useTransition()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData()
    formData.append("name", name)
    formData.append("bio", bio)
    formData.append("avatarUrl", avatarUrl)

    try {
      const res = await fetch("/api/settings/profile", { method: "POST", body: formData })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success("Profile updated successfully")
      }
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setChangingPassword(true)

    const formData = new FormData()
    formData.append("currentPassword", currentPassword)
    formData.append("newPassword", newPassword)
    formData.append("confirmPassword", confirmPassword)

    try {
      const res = await fetch("/api/settings/password", { method: "POST", body: formData })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
      } else {
        toast.success("Password changed successfully")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch {
      toast.error("Failed to change password")
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={props.initialEmail} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 size-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="size-4" />
            Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={changingPassword}>
              <Lock className="mr-2 size-4" />
              {changingPassword ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* AI Assistant */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="size-4" />
            AI Assistant
          </CardTitle>
          <CardDescription>
            Enable the AI assistant to get instant help with campus resources, study tips, and more.
            Your conversations are not stored. Crisis keywords are never persisted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={() => {
              const fd = new FormData()
              fd.set('optIn', String(!assistantOptIn))
              startOptInTransition(async () => {
                try {
                  await updateAssistantOptIn(fd)
                  setAssistantOptIn(!assistantOptIn)
                  toast.success(assistantOptIn ? 'AI assistant disabled' : 'AI assistant enabled')
                } catch {
                  toast.error('Failed to update preference')
                }
              })
            }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">
                  {assistantOptIn ? 'AI assistant is enabled' : 'AI assistant is disabled'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {assistantOptIn
                    ? 'You can use the AI assistant from the sidebar.'
                    : 'Enable to get AI-powered support.'}
                </p>
              </div>
              <Button type="submit" variant={assistantOptIn ? 'outline' : 'default'} disabled={optInPending}>
                {assistantOptIn ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
