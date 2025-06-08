
// Simulador de servicio de email
export const sendCertificateEmail = async (email, certificateData, pdfBlob) => {
  // En un entorno real, aquí se integraría con un servicio de email como EmailJS, SendGrid, etc.
  
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Email enviado a: ${email}`);
      console.log(`Certificado para: ${certificateData.nombres} ${certificateData.apellidos}`);
      console.log(`Curso: ${certificateData.curso}`);
      console.log(`Código: ${certificateData.codigoUnico}`);
      
      // Simular éxito del envío
      resolve({
        success: true,
        message: 'Certificado enviado por email exitosamente'
      });
    }, 2000);
  });
};

// Función para validar email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
