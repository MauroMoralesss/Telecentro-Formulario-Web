import { useState, useEffect } from 'react';
import axios from '../api/axios';

export const useFetch = (endpoint) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(endpoint, {
        withCredentials: true
      });
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, isLoading, error, refetch };
};

export default useFetch; 