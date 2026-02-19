
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Settings as SettingsIcon, Mail, BellRing, Save, Loader2, AlertCircle } from "lucide-react"
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"

export default function SettingsPage() {
  const { firestore } = useFirestore()
  const { user, isUserLoading: isAuthLoading } = useUser()
  const { toast } = useToast()

  const settingsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return doc(firestore, "users", user.uid, "settings")
  }, [firestore, user])

  const { data: settings, isLoading: isDocLoading } = useDoc(settingsRef)

  const [threshold, setThreshold] = useState(30)
  const [email, setEmail] = useState("admin@tempalert.io")
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setThreshold(settings.temperatureThreshold || 30)
      setEmail(settings.alertEmail || "")
      setEmailAlerts(settings.emailAlerts !== false)
      setPushNotifications(settings.pushNotifications !== false)
    }
  }, [settings])

  const handleSave = () => {
    if (!settingsRef || !user) {
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour enregistrer les paramètres.",
      })
      return
    }

    setIsSaving(true)
    
    setDocumentNonBlocking(settingsRef, {
      id: "settings",
      externalAuthId: user.uid,
      alertEmail: email,
      temperatureThreshold: threshold,
      unitPreference: "Celsius",
      emailAlerts,
      pushNotifications,
      updatedAt: new Date().toISOString(),
      createdAt: settings?.createdAt || new Date().toISOString(),
    }, { merge: true })

    // Simuler un court délai pour le feedback visuel
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Paramètres enregistrés",
        description: "Vos seuils et préférences ont été mis à jour avec succès.",
      })
    }, 500)
  }

  if (isAuthLoading || (user && isDocLoading)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">Initialisation de la session en cours...</p>
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
            <CardDescription>Définissez la limite de température critique manuellement ou via le slider</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-lg">Valeur Critique (°C)</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="number" 
                    value={threshold} 
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-24 text-right font-bold text-primary text-xl border-primary/20"
                    min={0}
                    max={100}
                    step={0.1}
                  />
                </div>
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
                <span>35°C (Recommandé)</span>
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
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 px-8 min-w-[200px]">
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? "Enregistrement..." : "Appliquer les Changements"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
