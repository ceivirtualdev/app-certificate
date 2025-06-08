
import { supabase } from '@/lib/supabaseClient';
import { hashPassword as localHashPassword } from '@/utils/crypto';

export const storage = {
  getAdmins: async () => {
    console.warn("getAdmins from storage.js is deprecated. Admin auth is handled by Supabase Auth.");
    return [];
  },
  
  saveAdmins: async (admins) => {
    console.warn("saveAdmins from storage.js is deprecated. Admin auth is handled by Supabase Auth.");
    return null;
  },

  getCertificates: async () => {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        course:courses ( name )
      `)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error fetching certificates:', error);
      return [];
    }
    return data.map(cert => ({ ...cert, curso: cert.course?.name || cert.curso_nombre }));
  },
  
  addCertificate: async (certificateData) => {
    const { curso, ...restOfData } = certificateData;

    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id, name')
      .eq('name', curso)
      .single();

    if (courseError && courseError.code !== 'PGRST116') {
        console.error('Error fetching course for certificate:', courseError);
        throw new Error('Error finding course: ' + courseError.message);
    }
    
    const newCertificate = {
      ...restOfData,
      curso_id: courseData?.id || null,
      curso_nombre: courseData?.name || curso 
    };

    const { data, error } = await supabase
      .from('certificates')
      .insert([newCertificate])
      .select();

    if (error) {
      console.error('Error adding certificate:', error);
      throw error;
    }
    return data ? data[0] : null;
  },

  getCourses: async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('name')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
    return data.map(c => c.name);
  },
  
  addCourse: async (courseName) => {
    const { data, error } = await supabase
      .from('courses')
      .insert([{ name: courseName }])
      .select();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return false; // Indicate course already exists
      }
      console.error('Error adding course:', error);
      throw error;
    }
    return data ? true : false;
  },

  deleteCourse: async (courseName) => {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('name', courseName);

    if (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
    return true;
  },
  
  getConfig: async () => {
    const { data, error } = await supabase
      .from('app_config')
      .select('*')
      .eq('id', 1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
      console.error('Error fetching config:', error);
      return { institutionName: 'Instituto Predeterminado', logoUrl: '', signatureUrl: '', primaryColor: '#003366', secondaryColor: '#f8fafc' };
    }
    return data || { institutionName: 'Instituto Predeterminado', logoUrl: '', signatureUrl: '', primaryColor: '#003366', secondaryColor: '#f8fafc' };
  },
  
  saveConfig: async (configData) => {
    const { data, error } = await supabase
      .from('app_config')
      .update(configData)
      .eq('id', 1)
      .select();
      
    if (error) {
      console.error('Error saving config:', error);
      throw error;
    }
    return data ? data[0] : null;
  }
};
