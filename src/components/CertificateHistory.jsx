
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { storage } from '@/utils/storage';
import { generateCertificatePDF } from '@/utils/pdfGenerator';
import { Search, Download, Calendar, Award, FileText, User } from 'lucide-react';

const CertificateHistory = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const allCertificates = await storage.getCertificates();
      setCertificates(allCertificates);
      setFilteredCertificates(allCertificates);
      const appConfig = await storage.getConfig();
      setConfig(appConfig);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCertificates(certificates);
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = certificates.filter(cert =>
        (cert.nombres && cert.nombres.toLowerCase().includes(lowerSearchTerm)) ||
        (cert.apellidos && cert.apellidos.toLowerCase().includes(lowerSearchTerm)) ||
        (cert.identificacion && cert.identificacion.toLowerCase().includes(lowerSearchTerm)) ||
        (cert.curso && cert.curso.toLowerCase().includes(lowerSearchTerm)) ||
        (cert.codigo_unico && cert.codigo_unico.toLowerCase().includes(lowerSearchTerm))
      );
      setFilteredCertificates(filtered);
    }
  }, [searchTerm, certificates]);

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
    <div className="space-y-6">
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 montserrat">
                Historial de Constancias
              </CardTitle>
              <CardDescription>
                Consulta y descarga constancias emitidas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nombre, identificación, curso o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            
            <div className="text-sm text-gray-600">
              Mostrando {filteredCertificates.length} de {certificates.length} constancias
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredCertificates.length === 0 ? (
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {certificates.length === 0 ? 'No hay certificados' : 'Sin resultados'}
            </h3>
            <p className="text-gray-600">
              {certificates.length === 0 
                ? 'Aún no se han generado constancias'
                : 'No se encontraron constancias que coincidan con tu búsqueda'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCertificates.map((certificate) => (
            <Card key={certificate.id} className="shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-5 h-5 text-green-600" />
                      <h3 className="text-xl font-semibold text-gray-900 montserrat">
                        {certificate.nombres} {certificate.apellidos}
                      </h3>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
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
                        <p className="text-sm text-gray-600 mb-1">Identificación</p>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-gray-500" />
                          <p className="font-medium text-gray-900">{certificate.identificacion}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Email</p>
                        <p className="font-medium text-gray-900">{certificate.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Código de Verificación</p>
                        <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block">
                          {certificate.codigo_unico}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleDownload(certificate)}
                    className="ml-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    disabled={!config}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificateHistory;
