'use client';

import { useState, useEffect } from "react";
import { TempGauge } from "@/components/temp-gauge";
import { TempChart } from "@/components/temp-chart";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Zap, Activity, Waves, Loader2 } from "lucide-react";

/**
 * Tableau de Bord Principal - Version Institutionnelle ENIM
 */
export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="w-6 h-6 text-primary" />
             </div>
             <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tableau de Bord</h1>
          </div>
          <p className="text-muted-foreground font-medium">Surveillance thermique des laboratoires en temps réel.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Connectivité</span>
              <span className="text-sm font-bold text-green-600">Serveur Actif</span>
           </div>
           <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-600 fill-green-600" />
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jauge Principale */}
        <div className="lg:col-span-1">
          <Card className="h-full border-none shadow-xl bg-white relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
            <CardContent className="pt-8">
              <TempGauge />
            </CardContent>
          </Card>
        </div>
        
        {/* Graphique et Statistiques */}
        <div className="lg:col-span-2 space-y-6">
          <TempChart />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-none shadow-lg bg-white transition-all hover:shadow-primary/5">
              <CardContent className="pt-6 flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sécurité</p>
                  <p className="text-lg font-bold text-slate-900 leading-tight">Canal Chiffré TLS</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Protection des données ENIM</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white transition-all hover:shadow-accent/5">
              <CardContent className="pt-6 flex items-start gap-4">
                <div className="p-3 bg-orange-50 rounded-2xl">
                  <Waves className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Analyse IA</p>
                  <p className="text-lg font-bold text-slate-900 leading-tight">Gemini 2.5 Prêt</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Génération d'alertes intelligentes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <footer className="pt-8 border-t text-center">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
          École Nationale d'Ingénieurs de Monastir - Département Électronique
        </p>
      </footer>
    </div>
  );
}
