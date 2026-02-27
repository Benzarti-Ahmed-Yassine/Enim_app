'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDoors, setShowDoors] = useState(true);
  
  const enimLogo = PlaceHolderImages.find(img => img.id === 'enim-logo');

  useEffect(() => {
    const timer = setTimeout(() => setShowDoors(false), 2000);
    if (user && !isUserLoading) {
      router.push('/');
    }
    return () => clearTimeout(timer);
  }, [user, isUserLoading, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Accès Autorisé", description: "Chargement de votre espace sécurisé..." });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Échec d'Authentification", 
        description: "Identifiants institutionnels non reconnus." 
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {showDoors && (
        <>
          <div className="door-overlay door-left animate-slide-door-left flex flex-col items-end pr-8">
             <h1 className="text-white text-4xl font-bold tracking-tighter">E N I</h1>
          </div>
          <div className="door-overlay door-right animate-slide-door-right flex flex-col items-start pl-8">
             <h1 className="text-white text-4xl font-bold tracking-tighter">M</h1>
          </div>
        </>
      )}

      <div className="w-full max-w-md animate-fade-in-content z-10 px-4">
        <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pt-8">
            <div className="mx-auto w-24 h-24 relative">
              {enimLogo && (
                <Image 
                  src={enimLogo.imageUrl} 
                  alt="ENIM Logo" 
                  fill 
                  className="object-contain"
                  priority
                />
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">Portail Académique</h2>
              <CardDescription className="text-primary font-semibold flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Accès Sécurisé ENIM
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Institutionnel</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="nom.prenom@enim.tn" 
                    className="pl-10 h-11" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10 h-11" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 text-base font-bold transition-all hover:scale-[1.02]" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                S'identifier
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-1 text-[10px] text-muted-foreground text-center border-t py-4 bg-slate-50/50 rounded-b-lg">
            <p className="font-bold uppercase tracking-widest text-primary/80">ENIM Monastir - TempAlert</p>
            <p>Système de Surveillance Haute Précision v3.0</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}