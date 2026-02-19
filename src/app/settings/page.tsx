"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Settings as SettingsIcon, Mail, BellRing, Save, Loader2 } from "lucide-react"
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"

export default function SettingsPage() {
  const { firestore } = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()

  const settingsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return doc(firestore, "users", user.uid, "settings", "preferences")
  }, [firestore, user])

  const { data: settings, isLoading } = useDoc(settingsRef)

  const [threshold, setThreshold] = useState(30)
  const [email, setEmail] = useState("admin@tempalert.io")
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)

  useEffect(() => {
    if (settings) {
      setThreshold(settings.temperatureThreshold || 30)
      setEmail(settings.alertEmail || "")
      setEmailAlerts(settings.emailAlerts !== false)
      setPushNotifications(settings.pushNotifications !== false)
    }
  }, [settings])

  const handleSave = () => {
    if (!settingsRef || !user) return

    setDocumentNonBlocking(settingsRef, {
      externalAuthId: user.uid,
      alertEmail: email,
      temperatureThreshold: threshold,
      unitPreference: "Celsius",
      emailAlerts,
      pushNotifications,
      updatedAt: new Date().toISOString(),
      createdAt: settings?.createdAt || new Date().toISOString(),
    }, { merge: true })

    toast({
      title: "Paramètres enregistrés",
      description: "Vos seuils et préférences ont été mis à jour dans le cloud.",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
           <SettingsIcon className="w-6 h-6 text-primary" />
           <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Configuration</h1>
        </div>
        <p className="text-muted-foreground">Ajustez la sensibilité du système et les destinations d'alerte.</p>
      </header>

      <div className="grid gap-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Contrôle du Seuil</CardTitle>
            <CardDescription>Définissez la limite de température critique</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg">Valeur Critique</Label>
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
                <span>35°C (Équilibré)</span>
                <span>60°C</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Canaux d'Alerte</CardTitle>
            <CardDescription>Comment souhaitez-vous être notifié ?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Alertes E-mail</p>
                  <p className="text-xs text-muted-foreground">Notification via système d'alerte</p>
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
                  <p className="font-semibold">Notifications Push</p>
                  <p className="text-xs text-muted-foreground">Alertes instantanées</p>
                </div>
              </div>
              <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
            </div>
            
            <div className="pt-4 border-t">
              <Label htmlFor="email-input">E-mail du Destinataire</Label>
              <Input 
                id="email-input"
                type="email"
                placeholder="votre-email@example.com" 
                className="mt-2" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 py-4 flex justify-end">
            <Button onClick={handleSave} className="gap-2 px-8">
              <Save className="w-4 h-4" />
              Appliquer les Changements
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
