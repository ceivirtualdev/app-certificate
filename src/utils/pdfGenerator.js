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

  // Fondo general
  pdf.setFillColor(248, 250, 252);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Borde doble institucional
  pdf.setDrawColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  pdf.setLineWidth(2);
  pdf.rect(20, 20, pageWidth - 40, pageHeight - 40); // exterior
  pdf.setLineWidth(0.8);
  pdf.rect(25, 25, pageWidth - 50, pageHeight - 50); // interior

  // Logo centrado en la parte superior (altura fija, ancho automático)
  if (config.logoUrl) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = config.logoUrl;
      await new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            const logoHeight = 15;
            const aspectRatio = img.width / img.height;
            const logoWidth = logoHeight * aspectRatio;
            const x = (pageWidth - logoWidth) / 2;
            pdf.addImage(img, 'PNG', x, 28, logoWidth, logoHeight);
            resolve();
          } catch (e) {
            console.error("Error adding logo image to PDF:", e);
            reject(e);
          }
        };
        img.onerror = reject;
      });
    } catch (error) {
      console.log('Error al cargar o añadir logo:', error);
    }
  }

  // Título
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(32);
  pdf.setTextColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  pdf.text('CONSTANCIA DE FINALIZACIÓN', pageWidth / 2, 55, { align: 'center' });

  // Subtítulo
  pdf.setFontSize(18);
  pdf.setTextColor(100, 100, 100);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Se otorga a', pageWidth / 2, 68, { align: 'center' });

  // Nombre del estudiante
  const studentName = `${certificateData.nombres} ${certificateData.apellidos}`;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(26);
  pdf.setTextColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  pdf.text(studentName.toUpperCase(), pageWidth / 2, 85, { align: 'center' });

  const nameWidth = pdf.getTextWidth(studentName.toUpperCase());
  const lineStart = (pageWidth - nameWidth) / 2;
  const lineEnd = (pageWidth + nameWidth) / 2;
  pdf.setDrawColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  pdf.setLineWidth(0.5);
  pdf.line(lineStart, 88, lineEnd, 88);

  // Descripción del curso
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(14);
  pdf.setTextColor(60, 60, 60);
  pdf.text('por haber completado satisfactoriamente el', pageWidth / 2, 100, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.setTextColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  pdf.text(certificateData.curso, pageWidth / 2, 115, { align: 'center' });

  // Fecha y horas
  const fecha = new Date(certificateData.fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor(60, 60, 60);
  pdf.text(`Otorgado el ${fecha} con una intensidad de 120 horas`, pageWidth / 2, 125, { align: 'center' });

  // Nombre de la institución
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(rgbPrimary.r, rgbPrimary.g, rgbPrimary.b);
  pdf.text(config.institutionName, pageWidth / 2, 140, { align: 'center' });

  // Firma centrada dentro del área
  if (config.signatureUrl) {
    try {
      const sigImg = new Image();
      sigImg.crossOrigin = "anonymous";
      sigImg.src = config.signatureUrl;
      await new Promise((resolve, reject) => {
        sigImg.onload = () => {
          try {
            const sigWidth = 50;
            const sigHeight = 20;
            const sigX = (pageWidth - sigWidth) / 2;
            const sigY = 150;
            pdf.addImage(sigImg, 'PNG', sigX, sigY, sigWidth, sigHeight);

            // Línea bajo la firma
            const lineY = sigY + sigHeight + 5;
            pdf.setDrawColor(100, 100, 100);
            pdf.setLineWidth(0.3);
            pdf.line(pageWidth / 2 - 30, lineY, pageWidth / 2 + 30, lineY);

            // Cargo
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text('Director Académico', pageWidth / 2, lineY + 6, { align: 'center' });

            resolve();
          } catch (e) {
            console.error("Error adding signature image to PDF:", e);
            reject(e);
          }
        };
        sigImg.onerror = reject;
      });
    } catch (error) {
      console.log('Error al cargar o añadir firma:', error);
    }
  }

  // Código único + validación
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
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : { r: 0, g: 51, b: 102 };
}
