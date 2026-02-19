'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2, ShieldCheck, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Connexion réussie", description: "Chargement du tableau de bord..." });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Échec de connexion", 
        description: "Identifiants incorrects. L'inscription est désactivée." 
      });
      setIsLoading(false);
    }
  };

  if (user && !isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary w-12 h-12 rounded-xl flex items-center justify-center mb-2">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Accès Restreint</CardTitle>
          <CardDescription>Connectez-vous avec votre compte administrateur</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail professionnel</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="nom@exemple.com" 
                  className="pl-10" 
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
                  className="pl-10" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
              Se Connecter
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 justify-center text-[10px] text-muted-foreground text-center">
          <p>L'inscription de nouveaux comptes est gérée par l'administrateur système.</p>
          <p>Authentification sécurisée par Firebase</p>
        </CardFooter>
      </Card>
    </div>
  );
}