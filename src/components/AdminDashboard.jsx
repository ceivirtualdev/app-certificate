
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CertificateForm from '@/components/CertificateForm';
import CourseManager from '@/components/CourseManager';
import CertificateHistory from '@/components/CertificateHistory';
import { LogOut, Award, BookOpen, FileText, Settings } from 'lucide-react';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('generate');

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      <div className="flex items-center gap-3">
        <div className="w-20 h-20 flex items-center justify-center">
          <img
            src="https://img.ceivirtual.co/app/logo-milan.png"
            alt="Logo Sistema Milan"
            className="w-20 h-20 object-contain"
          />
        </div>
        <div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 montserrat">
                  Panel Administrativo
                </h1>
                <p className="text-sm text-gray-600">
                  Bienvenido, {user.username}
                </p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Generar Constancia</span>
              <span className="sm:hidden">Generar</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Gestionar Cursos</span>
              <span className="sm:hidden">Cursos</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Historial</span>
              <span className="sm:hidden">Historial</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 montserrat">
                Generar Nueva Constancia
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Completa la información del estudiante para generar y enviar su constancia académica
              </p>
            </div>
            <CertificateForm />
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 montserrat">
                Gestión de Cursos
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Administra los cursos y diplomados disponibles para las constancias
              </p>
            </div>
            <CourseManager />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 montserrat">
                Historial de Constancias
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Consulta, busca y descarga constancias emitidas anteriormente
              </p>
            </div>
            <CertificateHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
