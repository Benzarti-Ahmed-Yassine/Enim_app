"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Settings as SettingsIcon, Mail, Save, Loader2, AlertCircle } from "lucide-react"
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"

export default function SettingsPage() {
  const firestore = useFirestore()
  const { user, isUserLoading: isAuthLoading } = useUser()
  const { toast } = useToast()

  const settingsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return doc(firestore, "users", user.uid, "settings", "current")
  }, [firestore, user])

  const { data: settings, isLoading: isDocLoading } = useDoc(settingsRef)

  const [threshold, setThreshold] = useState(30)
  const [email, setEmail] = useState("")
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setThreshold(settings.temperatureThreshold ?? 30)
      setEmail(settings.alertEmail ?? "")
      setEmailAlerts(settings.emailAlerts !== false)
      setPushNotifications(settings.pushNotifications !== false)
    }
  }, [settings])

  const handleSave = () => {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Erreur d'accès",
        description: "Session introuvable. Veuillez rafraîchir la page.",
      })
      return
    }

    setIsSaving(true)
    const docRef = doc(firestore, "users", user.uid, "settings", "current")

    setDocumentNonBlocking(docRef, {
      id: "current",
      externalAuthId: user.uid,
      alertEmail: email,
      temperatureThreshold: threshold,
      unitPreference: "Celsius",
      emailAlerts,
      pushNotifications,
      updatedAt: new Date().toISOString(),
      createdAt: settings?.createdAt || new Date().toISOString(),
    }, { merge: true })

    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Succès",
        description: "Paramètres mis à jour.",
      })
    }, 800)
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
        <p className="text-muted-foreground">Veuillez vous connecter pour accéder aux paramètres.</p>
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
        <p className="text-muted-foreground">Ajustez la sensibilité du système et vos canaux de notification.</p>
      </header>

      <div className="grid gap-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Seuil de Température</CardTitle>
            <CardDescription>Définissez la limite d'alerte critique.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-lg">Valeur Critique (°C)</Label>
                <Input 
                  type="number" 
                  value={threshold} 
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-24 text-right font-bold text-primary text-xl border-primary/20"
                />
              </div>
              <Slider
                value={[threshold]}
                onValueChange={(vals) => setThreshold(vals[0])}
                min={10}
                max={60}
                step={0.5}
                className="py-4"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold">Alertes E-mail</p>
                  <p className="text-xs text-muted-foreground">Envoi automatique via Genkit</p>
                </div>
              </div>
              <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>
            
            <div className="pt-4 border-t">
              <Label htmlFor="email-input">E-mail de destination</Label>
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
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 px-8 shadow-md">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Enregistrement..." : "Appliquer les Changements"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}