'use client';

import { useEffect, useState, useRef } from "react"
import { Thermometer, Loader2, AlertTriangle, Send, Cpu, Mail, CheckCircle2, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, collection, query, orderBy, limit } from "firebase/firestore"
import { sendAlertEmail } from "@/ai/flows/send-alert-email"

export function TempGauge() {
  const firestore = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const settingsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return doc(firestore, "users", user.uid, "settings", "current")
  }, [firestore, user])

  const { data: settings } = useDoc(settingsRef)
  
  const latestQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return query(
      collection(firestore, "users", user.uid, "temperatureMeasurements"),
      orderBy("timestamp", "desc"),
      limit(1)
    )
  }, [firestore, user])

  const { data: latestData, isLoading: isDataLoading } = useCollection(latestQuery)
  
  const [isSendingAlert, setIsSendingAlert] = useState(false)
  const lastAlertTime = useRef<number>(0)
  
  const threshold = settings?.temperatureThreshold || 30
  const currentTemp = latestData?.[0]?.value ?? latestData?.[0]?.temperature ?? null
  const isHigh = currentTemp !== null && currentTemp > threshold

  useEffect(() => {
    if (currentTemp === null || !user) return

    if (currentTemp > threshold) {
      const now = Date.now()
      // Évite le spam : 1 alerte toutes les 5 minutes (300 000 ms)
      if (now - lastAlertTime.current > 300000) {
        toast({
          variant: "destructive",
          title: "🚨 SEUIL CRITIQUE DÉPASSÉ",
          description: `Température actuelle : ${currentTemp.toFixed(1)}°C. Analyse et envoi des alertes...`,
        })
        
        if (settings?.emailAlerts !== false && settings?.alertEmail) {
          setIsSendingAlert(true)
          const recipients = settings.alertEmail.split(',').map(e => e.trim()).filter(e => e !== "")
          
          if (recipients.length > 0) {
            // Utilisation de allSettled pour ne pas bloquer si un email est invalide
            Promise.allSettled(recipients.map(recipient => 
              sendAlertEmail({
                recipientEmail: recipient,
                temperature: currentTemp,
                threshold: threshold,
                unit: "Celsius"
              })
            )).then((results) => {
               const successCount = results.filter(r => r.status === 'fulfilled').length
               const failCount = results.filter(r => r.status === 'rejected').length

               if (successCount > 0) {
                 toast({
                   title: "📩 Alertes Expédiées",
                   description: `${successCount} destinataire(s) notifié(s) avec succès.${failCount > 0 ? ` (${failCount} échec)` : ''}`,
                 })
               } else {
                 toast({
                   variant: "destructive",
                   title: "❌ Échec Critique",
                   description: "Aucun e-mail n'a pu être envoyé. Vérifiez votre configuration SMTP.",
                 })
               }
            }).finally(() => {
              setIsSendingAlert(false)
            })
          } else {
            setIsSendingAlert(false)
          }
        }
        lastAlertTime.current = now
      }
    }
  }, [currentTemp, threshold, settings, user, toast])

  if (isDataLoading) return (
    <div className="h-64 flex flex-col items-center justify-center gap-2">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className={`w-64 h-64 rounded-full border-8 flex flex-col items-center justify-center relative bg-card transition-all duration-1000 ${isHigh ? 'border-accent shadow-[0_0_50px_rgba(255,119,41,0.3)] scale-105 bg-accent/5' : 'border-primary shadow-sm'}`}>
        <Thermometer className={`w-8 h-8 mb-2 ${isHigh ? 'text-accent' : 'text-primary'}`} />
        
        {currentTemp !== null ? (
          <>
            <span className={`text-6xl font-bold tracking-tighter ${isHigh ? 'text-accent' : 'text-primary'}`}>
              {Number(currentTemp).toFixed(1)}°
            </span>
            <span className="text-sm font-medium text-muted-foreground">Celsius</span>
          </>
        ) : (
          <div className="text-center px-4 animate-pulse">
            <Cpu className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-[11px] text-muted-foreground font-medium">Lien Matériel Inactif</p>
          </div>
        )}
        
        {isHigh && (
          <div className="absolute -bottom-4 bg-accent text-white px-4 py-1.5 rounded-full text-xs font-bold animate-bounce flex items-center gap-2 shadow-lg border-2 border-white">
            <AlertTriangle className="w-3.5 h-3.5" />
            ÉTAT CRITIQUE
          </div>
        )}

        {isSendingAlert && (
          <div className="absolute top-2 right-2 p-2 bg-primary text-white rounded-full shadow-md animate-pulse">
            <Mail className="w-4 h-4" />
          </div>
        )}
      </div>
      
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
           <div className={`w-2.5 h-2.5 rounded-full ${currentTemp !== null ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
             {currentTemp !== null ? 'Flux Matériel Actif' : 'En attente du capteur'}
           </p>
        </div>
        <p className="text-sm font-medium text-slate-600">Seuil Configuré : <span className="text-accent font-bold">{threshold.toFixed(1)}°C</span></p>
      </div>
    </div>
  )
}
