
import jsPDF from 'jspdf';

export const generateCertificatePDF = async (certificateData, appConfig) => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const config = {
    institutionName: appConfig.institution_name || 'CEI VIRTUAL | UNILATINA - Universidad Latina',
    logoUrl: appConfig.logo_url || '',
    signatureUrl: appConfig.signature_url || '',
    primaryColor: appConfig.primary_color || '#003366',
  };
  
  const primaryColor = config.primaryColor;
  const rgbPrimary = hexToRgb(primaryColor);

  pdf.setFillColor(248, 250, 252);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
  pdf.setDrawColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  pdf.setLineWidth(3);
  pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
  pdf.setLineWidth(1);
  pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);

  if (config.logoUrl) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous"; 
      img.src = config.logoUrl;
      await new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            pdf.addImage(img, 'PNG', 25, 25, 30, 30);
            resolve();
          } catch (e) {
            console.error("Error adding logo image to PDF:", e);
            reject(e);
          }
        };
        img.onerror = (e) => {
          console.error("Error loading logo image for PDF:", e);
          reject(e);
        };
      });
    } catch (error) {
      console.log('Error al cargar o añadir logo:', error);
    }
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(28);
  pdf.setTextColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  pdf.text('CONSTANCIA DE FINALIZACIÓN', pageWidth / 2, 45, { align: 'center' });

  pdf.setFontSize(16);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Se da constancia que', pageWidth / 2, 60, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  pdf.setTextColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  const studentName = `${certificateData.nombres} ${certificateData.apellidos}`;
  pdf.text(studentName.toUpperCase(), pageWidth / 2, 80, { align: 'center' });

  pdf.setDrawColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  pdf.setLineWidth(0.5);
  const nameWidth = pdf.getTextWidth(studentName.toUpperCase());
  const lineStart = (pageWidth - nameWidth) / 2;
  const lineEnd = (pageWidth + nameWidth) / 2;
  pdf.line(lineStart, 85, lineEnd, 85);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(14);
  pdf.setTextColor(60, 60, 60);
  pdf.text('ha completado satisfactoriamente el', pageWidth / 2, 100, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  pdf.text(certificateData.curso, pageWidth / 2, 115, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor(60, 60, 60);
  const fecha = new Date(certificateData.fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  pdf.text(`Otorgado el ${fecha} con una intensidad de 120 horas`, pageWidth / 2, 135, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  pdf.text(config.institutionName, pageWidth / 2, 155, { align: 'center' });

  if (config.signatureUrl) {
    try {
      const sigImg = new Image();
      sigImg.crossOrigin = "anonymous";
      sigImg.src = config.signatureUrl;
      await new Promise((resolve, reject) => {
        sigImg.onload = () => {
          try {
            pdf.addImage(sigImg, 'PNG', pageWidth / 2 - 25, 165, 50, 20);
            resolve();
          } catch(e) {
            console.error("Error adding signature image to PDF:", e);
            reject(e);
          }
        };
        sigImg.onerror = (e) => {
          console.error("Error loading signature image for PDF:", e);
          reject(e);
        };
      });
    } catch (error) {
      console.log('Error al cargar o añadir firma:', error);
    }
  }

  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.3);
  pdf.line(pageWidth / 2 - 30, 190, pageWidth / 2 + 30, 190);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Director Académico', pageWidth / 2, 195, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Código: ${certificateData.codigoUnico}`, 20, pageHeight - 15);
  
  const validationUrl = `${window.location.origin}/?validate=${certificateData.codigoUnico}`;
  pdf.text(`Validar en: ${validationUrl}`, pageWidth - 20, pageHeight - 15, { align: 'right' });

  return pdf;
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 51, b: 102 }; 
}
