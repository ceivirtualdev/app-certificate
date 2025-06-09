
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import LoginForm from '@/components/LoginForm';
import PublicSearch from '@/components/PublicSearch';
import AdminDashboard from '@/components/AdminDashboard';
import { supabase } from '@/lib/supabaseClient';
import { Award, Search, Shield, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const validateCode = urlParams.get('validate');
    if (validateCode) {
      setCurrentView('search');
    }

    const initializeApp = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
      } else if (sessionData?.session?.user) {
        const supabaseUser = sessionData.session.user;
        const username = supabaseUser.email?.split('@')[0] || 'Admin';
        setUser({ username, id: supabaseUser.id, email: supabaseUser.email });
        setCurrentView('admin');
      }
    };
    initializeApp();

    const { data: authListenerData } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const supabaseUser = session.user;
          const username = supabaseUser.email?.split('@')[0] || 'Admin';
          setUser({ username, id: supabaseUser.id, email: supabaseUser.email });
          setCurrentView('admin');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setCurrentView('home');
        }
      }
    );

    return () => {
      authListenerData?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
      // Even if Supabase reports "session_not_found", we still want to clear client-side state
      if (error.message.includes("Session from session_id claim in JWT does not exist") || error.message.includes("session_not_found")) {
        setUser(null);
        setCurrentView('home');
        toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." });
      } else {
        toast({ title: "Error al cerrar sesión", description: error.message, variant: "destructive" });
      }
    } else {
      // State update is handled by onAuthStateChange listener
      toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente." });
    }
  };

  if (currentView === 'login') {
    return <LoginForm />;
  }

  if (currentView === 'search') {
    return (
      <div>
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 montserrat">
                  Consulta de Certificados
                </h1>
              </div>
              <Button
                onClick={() => setCurrentView('home')}
                variant="outline"
                className="hover:bg-gray-50"
              >
                Volver al Inicio
              </Button>
            </div>
          </div>
        </div>
        <PublicSearch />
      </div>
    );
  }

  if (currentView === 'admin' && user) {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Toaster />
      
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center mb-8 shadow-2xl">
              <Award className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 montserrat">
              Te damos la bienvenida a Milan
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">CEI VIRTUAL | UNILATINA</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Sistema de gestión, generación y descarga de constancias académicas digitales
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => setCurrentView('login')}
                className="h-14 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Shield className="w-5 h-5 mr-2" />
                Acceso Administrativo
              </Button>
              
              <Button
                onClick={() => setCurrentView('search')}
                variant="outline"
                className="h-14 px-8 border-2 border-green-600 text-green-700 hover:bg-green-50 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                <Search className="w-5 h-5 mr-2" />
                Consultar Certificados
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4 montserrat">
              Características Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar certificados académicos de manera profesional
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Card className="h-full shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 montserrat">
                    Panel Administrativo
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Acceso seguro con autenticación de Supabase para administradores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Autenticación segura con Supabase
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Generación de certificados
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Gestión de cursos en base de datos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Historial completo en Supabase
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="h-full shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 montserrat">
                    Consulta Pública
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Verificación y descarga de certificados desde Supabase
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Búsqueda por identificación
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Validación de códigos únicos
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Descarga directa de PDFs
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Acceso público 24/7
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Card className="h-full shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 montserrat">
                    PDFs Profesionales
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Certificados con diseño horizontal personalizable y validación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Diseño horizontal elegante
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Google Fonts integradas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Códigos únicos de validación
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Envío automático por email
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6 montserrat">
              ¿Listo para comenzar?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Únete a las instituciones que confían en nuestro sistema para generar certificados académicos profesionales
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setCurrentView('login')}
                className="h-14 px-8 bg-white text-blue-600 hover:bg-gray-100 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Shield className="w-5 h-5 mr-2" />
                Comenzar Ahora
              </Button>
              <Button
                onClick={() => setCurrentView('search')}
                variant="outline"
                className="h-14 px-8 border-2 border-white text-white hover:bg-white/10 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                <Search className="w-5 h-5 mr-2" />
                Ver Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default App;
