"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Settings as SettingsIcon, Mail, Save, Loader2, AlertCircle, Users, Send } from "lucide-react"
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { sendAlertEmail } from "@/ai/flows/send-alert-email"

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
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    if (settings) {
      setThreshold(settings.temperatureThreshold ?? 30)
      setEmailList(settings.alertEmail ?? "")
      setEmailAlerts(settings.emailAlerts !== false)
    }
  }, [settings])

  const handleSave = () => {
    if (!user || !firestore) return
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
      toast({ title: "Sauvegardé", description: "Vos paramètres ont été mis à jour." })
    }, 600)
  }

  const handleTestEmail = async () => {
    if (!emailList) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez saisir au moins un e-mail." })
      return
    }
    setIsTesting(true)
    try {
      const result = await sendAlertEmail({
        recipientEmail: emailList,
        temperature: 0,
        threshold: 0,
        isTest: true
      })
      if (result.success) {
        toast({ title: "Test Réussi", description: `E-mail de test envoyé à ${result.recipientCount} destinataire(s).` })
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur de Test", description: "Impossible d'envoyer l'e-mail. Vérifiez vos identifiants." })
    } finally {
      setIsTesting(false)
    }
  }

  if (isAuthLoading || (user && isDocLoading)) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
           <SettingsIcon className="w-6 h-6 text-primary" />
           <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Configuration Système</h1>
        </div>
        <p className="text-muted-foreground">Gestion des seuils critiques et de la liste de diffusion ENIM.</p>
      </header>

      <div className="grid gap-6">
        <Card className="border-none shadow-lg overflow-hidden">
          <div className="h-1 bg-primary"></div>
          <CardHeader>
            <CardTitle className="text-lg">Paramètres Thermiques</CardTitle>
            <CardDescription>Seuil pour les alertes automatiques.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <Label className="text-base font-semibold">Seuil (°C)</Label>
              <div className="flex items-center gap-2">
                <Input type="number" step="0.1" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-24 text-center font-bold text-primary text-xl border-primary/30" />
                <span className="text-lg font-bold text-slate-400">°C</span>
              </div>
            </div>
            <Slider value={[threshold]} onValueChange={(vals) => setThreshold(vals[0])} min={0} max={100} step={0.5} />
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg overflow-hidden">
          <div className="h-1 bg-accent"></div>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Diffusion des Alertes
            </CardTitle>
            <CardDescription>Gérez les destinataires des notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <p className="font-bold text-sm">Activer les e-mails</p>
              </div>
              <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
            </div>
            <div className="space-y-3">
              <Label className="font-bold">Liste de diffusion (séparée par des virgules)</Label>
              <Input placeholder="exemple1@enim.tn, exemple2@gmail.com" value={emailList} onChange={(e) => setEmailList(e.target.value)} />
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={handleTestEmail} disabled={isTesting}>
              {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Envoyer un e-mail de test
            </Button>
          </CardContent>
          <CardFooter className="bg-slate-50/80 py-4 flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="px-10 font-bold">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Appliquer
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
