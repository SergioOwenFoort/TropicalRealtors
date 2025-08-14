import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabaseService } from '../services/supabaseService';
import { Realtor, RealtorUpload } from '../types';
import { toast } from 'react-hot-toast';

export function useRealtors(island?: 'bonaire' | 'aruba' | 'curacao', itemsPerPage: number = 12) {
  const [realtors, setRealtors] = useState<Realtor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const { user } = useAuth();

  const fetchRealtors = async (pageNumber: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      // First, get the total count of realtors for pagination
      const countOptions: any = {};
      if (island) {
        countOptions.island = island;
      }
      
      const totalRealtors = await supabaseService.getRealtorsCount(countOptions);
      setTotalCount(totalRealtors);
      setTotalPages(Math.ceil(totalRealtors / itemsPerPage));
      
      // Then fetch the realtors for the current page
      const options: any = {
        ...countOptions,
        page: pageNumber,
        limit: itemsPerPage
      };

      const fetchedRealtors = await supabaseService.getRealtors(options);
      setRealtors(fetchedRealtors);
      setPage(pageNumber);
    } catch (err: any) {
      setError(err.message || 'Fout bij het ophalen van makelaars');
      console.error('Error fetching realtors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealtors(1);
  }, [island, itemsPerPage]);

  const addRealtor = async (realtorData: RealtorUpload): Promise<Realtor> => {
    try {
      const newRealtor = await supabaseService.addRealtor(realtorData, user?.id);
      setRealtors(prevRealtors => [...prevRealtors, newRealtor]);
      toast.success('Makelaar succesvol toegevoegd');
      return newRealtor;
    } catch (err: any) {
      toast.error('Fout bij het toevoegen van makelaar');
      console.error('Error adding realtor:', err);
      throw err;
    }
  };

  const updateRealtor = async (id: string, updates: Partial<Realtor>): Promise<boolean> => {
    try {
      const success = await supabaseService.updateRealtor(id, updates);
      if (success) {
        setRealtors(prevRealtors =>
          prevRealtors.map(realtor => 
            realtor.id === id ? { ...realtor, ...updates } : realtor
          )
        );
        toast.success('Makelaar succesvol bijgewerkt');
      }
      return success;
    } catch (err: any) {
      toast.error('Fout bij het bijwerken van makelaar');
      console.error('Error updating realtor:', err);
      throw err;
    }
  };

  const deleteRealtor = async (id: string): Promise<boolean> => {
    try {
      const success = await supabaseService.deleteRealtor(id);
      if (success) {
        // Remove from local state immediately for better UX
        setRealtors(prevRealtors => prevRealtors.filter(realtor => realtor.id !== id));
        // Update total count
        setTotalCount(prev => prev - 1);
        setTotalPages(Math.ceil((totalCount - 1) / itemsPerPage));
        
        // If current page becomes empty and it's not the first page, go to previous page
        if (realtors.length === 1 && page > 1) {
          setPage(page - 1);
          await fetchRealtors(page - 1);
        }
        
        toast.success('Makelaar succesvol verwijderd');
      }
      return success;
    } catch (err: any) {
      console.error('Error deleting realtor:', err);
      // Don't show toast here, let the calling component handle it
      throw err;
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    fetchRealtors(pageNumber);
  };
  
  const nextPage = () => {
    if (page < totalPages) {
      fetchRealtors(page + 1);
    }
  };
  
  const previousPage = () => {
    if (page > 1) {
      fetchRealtors(page - 1);
    }
  };

  return {
    realtors,
    loading,
    error,
    page,
    totalPages,
    totalCount,
    addRealtor,
    updateRealtor,
    deleteRealtor,
    refreshRealtors: () => fetchRealtors(page),
    goToPage,
    nextPage,
    previousPage
  };
}
