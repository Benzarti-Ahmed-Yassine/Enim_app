
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
  const [emailList, setEmailList] = useState("")
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setThreshold(settings.temperatureThreshold ?? 30)
      setEmailList(settings.alertEmail ?? "")
      setEmailAlerts(settings.emailAlerts !== false)
    }
  }, [settings])

  const handleSave = () => {
    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Erreur", description: "Session introuvable." })
      return
    }

    // Validation basique (max 5 emails)
    const emails = emailList.split(',').map(e => e.trim()).filter(e => e !== "")
    if (emails.length > 5) {
      toast({ variant: "destructive", title: "Limite atteinte", description: "Maximum 5 adresses e-mail autorisées." })
      return
    }

    setIsSaving(true)
    const docRef = doc(firestore, "users", user.uid, "settings", "current")

    const payload = {
      id: "current",
      externalAuthId: user.uid,
      alertEmail: emailList,
      temperatureThreshold: Number(threshold),
      unitPreference: "Celsius",
      emailAlerts,
      updatedAt: new Date().toISOString(),
      createdAt: settings?.createdAt || new Date().toISOString(),
    }

    setDocumentNonBlocking(docRef, payload, { merge: true })

    setTimeout(() => {
      setIsSaving(false)
      toast({ title: "Configuration enregistrée", description: "Vos paramètres et alertes ont été mis à jour." })
    }, 600)
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
        <p className="text-muted-foreground">Veuillez vous connecter.</p>
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
        <p className="text-muted-foreground">Paramétrez vos alertes critiques et destinataires.</p>
      </header>

      <div className="grid gap-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Seuil de Température</CardTitle>
            <CardDescription>Ajustez la limite d'alerte critique.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Label className="text-lg">Valeur Critique (°C)</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  value={threshold} 
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-28 text-right font-bold text-primary text-xl border-primary/20"
                />
              </div>
              <Slider
                value={[threshold]}
                onValueChange={(vals) => setThreshold(vals[0])}
                min={0}
                max={100}
                step={0.5}
                className="py-4"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Notifications Multi-Destinataires</CardTitle>
            <CardDescription>Entrez jusqu'à 5 e-mails séparés par des virgules.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-primary" />
                <p className="font-semibold">Activer les alertes</p>
              </div>
              <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>
            
            <div className="pt-4 border-t space-y-2">
              <Label htmlFor="email-input">Liste des destinataires</Label>
              <Input 
                id="email-input"
                type="text"
                placeholder="mail1@test.com, mail2@test.com..." 
                value={emailList}
                onChange={(e) => setEmailList(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground italic">
                Séparez les adresses par une virgule. Les alertes seront envoyées simultanément.
              </p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 py-4 flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 px-8">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Sauvegarder
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
