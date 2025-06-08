import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { storage } from '@/utils/storage';
import { generateUniqueCode } from '@/utils/crypto';
import { generateCertificatePDF } from '@/utils/pdfGenerator';
import { sendCertificateEmail, validateEmail } from '@/utils/emailService';
import { FileText, User, Mail, Phone, Calendar, Award, Download } from 'lucide-react';

const CertificateForm = () => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    identificacion: '',
    email: '',
    telefono: '',
    curso: '',
    fecha: new Date().toISOString().split('T')[0]
  });
  
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchedCourses = await storage.getCourses();
        setCourses(fetchedCourses);
        const appConfig = await storage.getConfig();
        setConfig(appConfig);
      } catch (error) {
        console.error("Error fetching initial data for CertificateForm:", error);
        toast({
          title: "Error de Carga",
          description: "No se pudo cargar la configuración o los cursos. Intenta recargar.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ['nombres', 'apellidos', 'identificacion', 'email', 'curso'];
    const missing = required.filter(field => !formData[field] || !formData[field].trim());
    
    if (missing.length > 0) {
      toast({
        title: "Campos requeridos",
        description: `Por favor completa: ${missing.join(', ')}`,
        variant: "destructive"
      });
      return false;
    }

    if (!validateEmail(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const checkDuplicate = async () => {
    const certificates = await storage.getCertificates();
    const duplicate = certificates.find(cert => 
      cert.identificacion === formData.identificacion && 
      cert.curso === formData.curso 
    );
    
    if (duplicate) {
      toast({
        title: "Certificado duplicado",
        description: "Ya existe un certificado para esta persona en este curso",
        variant: "destructive"
      });
      return true;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    const isDuplicate = await checkDuplicate();
    if (isDuplicate) return;
    
    if (!config) {
       toast({
        title: "Error de configuración",
        description: "La configuración de la aplicación no está cargada. Por favor, recarga la página.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setIsGenerating(true);

    try {
      const codigoUnico = generateUniqueCode();
      
      const certificateDataForDb = {
        ...formData,
        codigo_unico: codigoUnico, 
        fecha_creacion: new Date().toISOString(),
        config_institution_name: config.institution_name,
        config_logo_url: config.logo_url,
        config_signature_url: config.signature_url,
        config_primary_color: config.primary_color,
      };
      
      await storage.addCertificate(certificateDataForDb);
      
      const certificateDataForPdfAndEmail = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        curso: formData.curso,
        fecha: formData.fecha,
        codigoUnico: codigoUnico, 
      };

      const pdf = await generateCertificatePDF(
        certificateDataForPdfAndEmail, 
        config 
      );
      
      pdf.save(`Certificado_${formData.nombres}_${formData.apellidos}.pdf`);

      const pdfBlob = pdf.output('blob');
      await sendCertificateEmail(formData.email, certificateDataForPdfAndEmail, pdfBlob);

      toast({
        title: "¡Certificado generado exitosamente!",
        description: `Código: ${codigoUnico}. PDF descargado y email enviado.`
      });

      setFormData({
        nombres: '',
        apellidos: '',
        identificacion: '',
        email: '',
        telefono: '',
        curso: '',
        fecha: new Date().toISOString().split('T')[0]
      });

    } catch (error) {
      console.error("Error en handleSubmit:", error);
      toast({
        title: "Error",
        description: `Error al generar el certificado: ${error.message}. Revisa la consola para más detalles.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 montserrat">
              Generar Certificado
            </CardTitle>
            <CardDescription>
              Completa la información del estudiante para generar el certificado
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombres" className="text-sm font-medium text-gray-700">
                Nombres *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="nombres"
                  type="text"
                  placeholder="Nombres del estudiante"
                  value={formData.nombres}
                  onChange={(e) => handleInputChange('nombres', e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellidos" className="text-sm font-medium text-gray-700">
                Apellidos *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="apellidos"
                  type="text"
                  placeholder="Apellidos del estudiante"
                  value={formData.apellidos}
                  onChange={(e) => handleInputChange('apellidos', e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="identificacion" className="text-sm font-medium text-gray-700">
                Número de Identificación *
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="identificacion"
                  type="text"
                  placeholder="Cédula, pasaporte, etc."
                  value={formData.identificacion}
                  onChange={(e) => handleInputChange('identificacion', e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">
                Teléfono
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="Número de teléfono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="curso" className="text-sm font-medium text-gray-700">
                Curso/Diplomado *
              </Label>
              <Select value={formData.curso} onValueChange={(value) => handleInputChange('curso', value)}>
                <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Selecciona un curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((courseName, index) => (
                    <SelectItem key={index} value={courseName}>
                      {courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha" className="text-sm font-medium text-gray-700">
                Fecha de Emisión
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleInputChange('fecha', e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading || isGenerating || !config}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generar y Descargar
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CertificateForm;