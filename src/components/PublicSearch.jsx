
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { storage } from '@/utils/storage';
import { Search, FileText, Calendar, Award, Download } from 'lucide-react';
import { generateCertificatePDF } from '@/utils/pdfGenerator';

const PublicSearch = () => {
  const [searchId, setSearchId] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      const appConfig = await storage.getConfig();
      setConfig(appConfig);
    };
    fetchConfig();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa un número de identificación",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const allCertificates = await storage.getCertificates();
      const foundCertificates = allCertificates.filter(cert => 
        cert.identificacion && cert.identificacion.toLowerCase().includes(searchId.toLowerCase())
      );

      setCertificates(foundCertificates);

      if (foundCertificates.length === 0) {
        toast({
          title: "Sin resultados",
          description: "No se encontraron certificados para esta identificación"
        });
      } else {
        toast({
          title: "¡Certificados encontrados!",
          description: `Se encontraron ${foundCertificates.length} certificado(s)`
        });
      }
    } catch (error) {
      console.error("Error en handleSearch:", error);
      toast({
        title: "Error",
        description: "Error al buscar certificados. Revisa la consola para más detalles.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (certificate) => {
    if (!config) {
      toast({
        title: "Error de configuración",
        description: "La configuración de la aplicación no está cargada. Por favor, recarga la página.",
        variant: "destructive"
      });
      return;
    }
    try {
      const certificateDataForPdf = {
        ...certificate,
        codigoUnico: certificate.codigo_unico, 
      };
      const pdf = await generateCertificatePDF(certificateDataForPdf, config);
      pdf.save(`Certificado_${certificate.nombres}_${certificate.apellidos}.pdf`);
      
      toast({
        title: "¡Descarga exitosa!",
        description: "El certificado se ha descargado correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al generar el PDF",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 montserrat">
            Consulta de Certificados
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ingresa tu número de identificación para consultar tus certificados académicos
          </p>
        </div>

        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 montserrat">
              Buscar Certificados
            </CardTitle>
            <CardDescription>
              Utiliza tu número de cédula, pasaporte o documento de identidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="searchId" className="text-sm font-medium text-gray-700">
                  Número de Identificación
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="searchId"
                    type="text"
                    placeholder="Ej: 1234567890, CC123456789, etc."
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? 'Buscando...' : 'Buscar Certificados'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {certificates.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 montserrat">
              Certificados Encontrados
            </h2>
            {certificates.map((certificate, index) => (
              <Card key={certificate.id || index} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Award className="w-5 h-5 text-green-600" />
                        <h3 className="text-xl font-semibold text-gray-900 montserrat">
                          {certificate.nombres} {certificate.apellidos}
                        </h3>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Curso/Diplomado</p>
                          <p className="font-medium text-gray-900">{certificate.curso}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Fecha de Emisión</p>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <p className="font-medium text-gray-900">
                              {new Date(certificate.fecha).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Código de Verificación</p>
                          <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {certificate.codigo_unico}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Identificación</p>
                          <p className="font-medium text-gray-900">{certificate.identificacion}</p>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleDownload(certificate)}
                      className="ml-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                      disabled={!config}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicSearch;
