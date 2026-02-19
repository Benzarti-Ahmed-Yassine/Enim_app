
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { getThreshold, setThreshold as saveThreshold } from "@/lib/temp-data"
import { useToast } from "@/hooks/use-toast"
import { Settings as SettingsIcon, Mail, BellRing, Save } from "lucide-react"

export default function SettingsPage() {
  const [threshold, setThreshold] = useState(30)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    setThreshold(getThreshold())
  }, [])

  const handleSave = () => {
    saveThreshold(threshold)
    toast({
      title: "Settings Saved",
      description: "Your temperature threshold and preferences have been updated.",
    })
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
           <SettingsIcon className="w-6 h-6 text-primary" />
           <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Configuration</h1>
        </div>
        <p className="text-muted-foreground">Adjust system sensitivity and alert destinations.</p>
      </header>

      <div className="grid gap-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Threshold Control</CardTitle>
            <CardDescription>Define the critical temperature limit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg">Critical Value</Label>
                <span className="text-2xl font-bold text-primary">{threshold}°C</span>
              </div>
              <Slider
                value={[threshold]}
                onValueChange={(vals) => setThreshold(vals[0])}
                min={10}
                max={60}
                step={0.5}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>10°C</span>
                <span>35°C (Balanced)</span>
                <span>60°C</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manual">Manual Entry</Label>
                <Input 
                  id="manual" 
                  type="number" 
                  value={threshold} 
                  onChange={(e) => setThreshold(parseFloat(e.target.value))} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Alert Channels</CardTitle>
            <CardDescription>How should we notify you?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Email Alerts</p>
                  <p className="text-xs text-muted-foreground">Notifications via Nodemailer</p>
                </div>
              </div>
              <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-accent/10 p-2 rounded-full">
                  <BellRing className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">Instant browser alerts</p>
                </div>
              </div>
              <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
            </div>
            
            <div className="pt-4 border-t">
              <Label>Alert Recipient</Label>
              <Input placeholder="your-email@example.com" className="mt-2" defaultValue="admin@tempalert.io" />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 py-4 flex justify-end">
            <Button onClick={handleSave} className="gap-2 px-8">
              <Save className="w-4 h-4" />
              Apply Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
