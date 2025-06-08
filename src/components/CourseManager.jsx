import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { storage } from '@/utils/storage';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const CourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      const fetchedCourses = await storage.getCourses();
      setCourses(fetchedCourses);
    };
    fetchCourses();
  }, []);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    
    if (!newCourse.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa el nombre del curso",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await storage.addCourse(newCourse.trim());
      
      if (success) {
        const updatedCourses = await storage.getCourses();
        setCourses(updatedCourses);
        setNewCourse('');
        toast({
          title: "¡Curso agregado!",
          description: "El curso se ha agregado exitosamente"
        });
      } else {
        toast({
          title: "Curso duplicado",
          description: "Este curso ya existe en la lista",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error en handleAddCourse:", error);
      toast({
        title: "Error",
        description: "Error al agregar el curso. Revisa la consola para más detalles.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (courseToDelete) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('name', courseToDelete);

      if (error) throw error;

      const updatedCourses = courses.filter(course => course !== courseToDelete);
      setCourses(updatedCourses);
      
      toast({
        title: "Curso eliminado",
        description: "El curso se ha eliminado exitosamente"
      });
    } catch (error) {
      console.error("Error en handleDeleteCourse:", error);
      toast({
        title: "Error",
        description: "Error al eliminar el curso. Revisa la consola para más detalles.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 montserrat">
              Gestión de Cursos
            </CardTitle>
            <CardDescription>
              Administra los cursos y diplomados disponibles
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleAddCourse} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newCourse" className="text-sm font-medium text-gray-700">
              Nuevo Curso/Diplomado
            </Label>
            <div className="flex gap-2">
              <Input
                id="newCourse"
                type="text"
                placeholder="Ej: Diplomado en Marketing Digital"
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                className="flex-1 h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
              <Button 
                type="submit" 
                className="h-11 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                disabled={isLoading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        </form>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 montserrat">
            Cursos Disponibles ({courses.length})
          </h3>
          
          {courses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No hay cursos registrados</p>
            </div>
          ) : (
            <div className="space-y-2">
              {courses.map((course, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium text-gray-900">{course}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCourse(course)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseManager;