import { useState, useEffect } from 'react';
import axios from '../api/axios';

export const useHistorial = (formularioId) => {
  const [historial, setHistorial] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistorial = async () => {
    if (!formularioId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const [historialRes, estadisticasRes] = await Promise.all([
        axios.get(`/historial/${formularioId}`, { withCredentials: true }),
        axios.get(`/historial/${formularioId}/estadisticas`, { withCredentials: true })
      ]);

      console.log('Datos recibidos del backend:', {
        historial: historialRes.data,
        estadisticas: estadisticasRes.data
      });

      setHistorial(historialRes.data || []);
      setEstadisticas(estadisticasRes.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el historial');
      console.error('Error cargando historial:', err);
      setHistorial([]);
      setEstadisticas(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, [formularioId]);

  return {
    historial,
    estadisticas,
    isLoading,
    error,
    refetch: fetchHistorial
  };
}; 