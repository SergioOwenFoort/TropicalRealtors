import { useState } from 'react';
import { CarouselSlide, CarouselSlideInput } from '../types';
import { CarouselService } from '../services/carouselService';
import { useAuth } from './useAuth';

export function useCarouselSlides() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [userSlides, setUserSlides] = useState<CarouselSlide[]>([]);
  const [islandSlides, setIslandSlides] = useState<{ [key: string]: CarouselSlide[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch active slides for display by island
  const fetchActiveSlidesByIsland = async (island: 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten') => {
    try {
      setLoading(true);
      const activeSlides = await CarouselService.getActiveSlidesByIsland(island);
      setIslandSlides(prev => ({ ...prev, [island]: activeSlides }));
      return activeSlides;
    } catch (err) {
      setError('Failed to fetch carousel slides');
      console.error('Error fetching active slides by island:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch current week slides by island
  const fetchCurrentWeekSlidesByIsland = async (island: 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten') => {
    try {
      setLoading(true);
      const currentWeekSlides = await CarouselService.getCurrentWeekSlidesByIsland(island);
      setIslandSlides(prev => ({ ...prev, [island]: currentWeekSlides }));
      return currentWeekSlides;
    } catch (err) {
      setError('Failed to fetch current week slides');
      console.error('Error fetching current week slides:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch slides by island
  const fetchSlidesByIslandAndPeriod = async (island: 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten') => {
    try {
      setLoading(true);
      const periodSlides = await CarouselService.getSlidesByIslandAndPeriod(island);
      setIslandSlides(prev => ({ ...prev, [island]: periodSlides }));
      return periodSlides;
    } catch (err) {
      setError('Failed to fetch slides by island');
      console.error('Error fetching slides by island:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch all slides for management
  const fetchAllSlides = async () => {
    try {
      setLoading(true);
      const allSlides = await CarouselService.getAllSlides();
      setSlides(allSlides);
      return allSlides;
    } catch (err) {
      setError('Failed to fetch all slides');
      console.error('Error fetching all slides:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch slides by user
  const fetchSlidesByUser = async (userId: string) => {
    try {
      setLoading(true);
      const slides = await CarouselService.getSlidesByUser(userId);
      setUserSlides(slides);
      return slides;
    } catch (err) {
      setError('Failed to fetch user slides');
      console.error('Error fetching user slides:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a new slide
  const createSlide = async (slideData: CarouselSlideInput): Promise<CarouselSlide | null> => {
    try {
      setLoading(true);
      const newSlide = await CarouselService.createSlide(slideData);
      if (newSlide) {
        // Refresh the relevant island slides
        await fetchActiveSlidesByIsland(slideData.island);
      }
      return newSlide;
    } catch (err) {
      setError('Failed to create slide');
      console.error('Error creating slide:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update a slide
  const updateSlide = async (id: string, slideData: Partial<CarouselSlideInput>): Promise<CarouselSlide | null> => {
    try {
      setLoading(true);
      const updatedSlide = await CarouselService.updateSlide(id, slideData);
      if (updatedSlide) {
        // Refresh slides
        await fetchAllSlides();
        if (slideData.island) {
          await fetchActiveSlidesByIsland(slideData.island);
        }
      }
      return updatedSlide;
    } catch (err) {
      setError('Failed to update slide');
      console.error('Error updating slide:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a slide
  const deleteSlide = async (id: string, island: 'bonaire' | 'aruba' | 'curacao' | 'saba'): Promise<boolean> => {
    try {
      setLoading(true);
      const success = await CarouselService.deleteSlide(id);
      if (success) {
        // Refresh slides
        await fetchAllSlides();
        await fetchActiveSlidesByIsland(island);
      }
      return success;
    } catch (err) {
      setError('Failed to delete slide');
      console.error('Error deleting slide:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle slide active status
  const toggleSlideStatus = async (id: string, isActive: boolean, island: 'bonaire' | 'aruba' | 'curacao' | 'saba'): Promise<boolean> => {
    try {
      setLoading(true);
      const success = await CarouselService.toggleSlideStatus(id, isActive);
      if (success) {
        // Refresh slides
        await fetchAllSlides();
        await fetchActiveSlidesByIsland(island);
      }
      return success;
    } catch (err) {
      setError('Failed to toggle slide status');
      console.error('Error toggling slide status:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update slide order
  const updateSlideOrder = async (id: string, newOrder: number, island: 'bonaire' | 'aruba' | 'curacao' | 'saba'): Promise<boolean> => {
    try {
      setLoading(true);
      const success = await CarouselService.updateSlideOrder(id, newOrder);
      if (success) {
        // Refresh slides
        await fetchAllSlides();
        await fetchActiveSlidesByIsland(island);
      }
      return success;
    } catch (err) {
      setError('Failed to update slide order');
      console.error('Error updating slide order:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Upload image
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      if (!user?.id) {
        setError('User not authenticated');
        return null;
      }
      
      const imageUrl = await CarouselService.uploadImage(file, user.id);
      return imageUrl;
    } catch (err) {
      setError('Failed to upload image');
      console.error('Error uploading image:', err);
      return null;
    }
  };

  // Check slot availability
  const checkSlotAvailability = async (island: 'bonaire' | 'aruba' | 'curacao' | 'saba'): Promise<boolean> => {
    try {
      return await CarouselService.isSlotAvailable(island);
    } catch (err) {
      setError('Failed to check slot availability');
      console.error('Error checking slot availability:', err);
      return false;
    }
  };

  // Get slide counts
  const getSlideCounts = async (island: 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten'): Promise<number> => {
    try {
      return await CarouselService.getSlideCounts(island);
    } catch (err) {
      setError('Failed to get slide counts');
      console.error('Error getting slide counts:', err);
      return 0;
    }
  };

  // Get slide counts by period
  const getSlideCountsByPeriod = async (island: 'bonaire' | 'aruba' | 'curacao' | 'saba' | 'sint-eustatius' | 'sint-maarten', period: number): Promise<number> => {
    try {
      return await CarouselService.getSlideCountsByPeriod(island, period);
    } catch (err) {
      setError('Failed to get slide counts by period');
      console.error('Error getting slide counts by period:', err);
      return 0;
    }
  };

  // Cleanup test slides
  const cleanupTestSlides = async (): Promise<{ removed: number; slides: string[] }> => {
    try {
      setLoading(true);
      const result = await CarouselService.cleanupAllTestSlides();
      if (result.removed > 0) {
        // Refresh all slides
        await fetchAllSlides();
      }
      return result;
    } catch (err) {
      setError('Failed to cleanup test slides');
      console.error('Error cleaning up test slides:', err);
      return { removed: 0, slides: [] };
    } finally {
      setLoading(false);
    }
  };

  return {
    slides,
    userSlides,
    islandSlides,
    loading,
    error,
    
    // Fetch methods
    fetchActiveSlidesByIsland,
    fetchCurrentWeekSlidesByIsland,
    fetchSlidesByIslandAndPeriod,
    fetchAllSlides,
    fetchSlidesByUser,
    
    // CRUD methods
    createSlide,
    updateSlide,
    deleteSlide,
    
    // Management methods
    toggleSlideStatus,
    updateSlideOrder,
    uploadImage,
    checkSlotAvailability,
    getSlideCounts,
    getSlideCountsByPeriod,
    cleanupTestSlides,
    
    // Utility
    clearError: () => setError(null),
  };
}
