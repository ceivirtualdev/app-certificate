
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Lock, User as UserIcon, Mail } from 'lucide-react'; // Renamed User to UserIcon to avoid conflict

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    email: '', // Changed from username to email for Supabase auth
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error de autenticación",
        description: error.message || "Credenciales incorrectas. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } else if (data.user) {
      toast({
        title: "¡Bienvenido!",
        description: "Acceso autorizado correctamente."
      });
      // Navigation is handled by onAuthStateChange in App.jsx
    } else {
       toast({
        title: "Error de autenticación",
        description: "Ocurrió un error inesperado. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 montserrat">
            Acceso Administrativo
          </CardTitle>
          <CardDescription className="text-gray-600">
            Ingresa tus credenciales para generar certificados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 text-center">
              <strong>Todos los derechos reservados - 2025</strong><br />
              Desarrollado con amor en Medellín/Colombia por <a href='https://wa.me/573208048128'>Lenipseart Developer</a><br/>
              Para CEI VIRTUAL - UNILATINA
            </p>
             <p className="text-xs text-blue-700 text-center mt-2">
              Conectando educación virtual de calidad
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
