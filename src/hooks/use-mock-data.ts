"use client";

import { useState, useEffect, useCallback } from 'react';
import { generateMockId } from '@/lib/utils';

interface UseMockDataProps<T extends { id: string; createdAt: string; [key: string]: any }> {
  initialData: T[];
  itemsPerPage?: number;
}

export function useMockData<T extends { id: string; createdAt: string; [key: string]: any }>({
  initialData,
  itemsPerPage = 10,
}: UseMockDataProps<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialData.length / itemsPerPage));
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Simulate API loading

  const applyFiltersAndPagination = useCallback(() => {
    setIsLoading(true);
    let filteredData = data;

    if (searchTerm) {
      filteredData = data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Sort by createdAt descending by default
    filteredData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
    
    // Simulate async operation
    setTimeout(() => setIsLoading(false), 300);

    return filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [data, searchTerm, currentPage, itemsPerPage]);


  const [paginatedData, setPaginatedData] = useState<T[]>(applyFiltersAndPagination());

  useEffect(() => {
    setPaginatedData(applyFiltersAndPagination());
  }, [data, currentPage, searchTerm, applyFiltersAndPagination]);
  
  useEffect(() => {
    // Reset to first page if filters change total pages
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    } else if (totalPages === 0 && initialData.length > 0 && searchTerm) { // No results from search
      // If search yields no results, paginatedData will be empty. totalPages will be 0.
      // This is fine, showing "0 of 0" entries.
    } else if (totalPages === 0 && initialData.length === 0) {
      // initial state, no data
    }

  }, [totalPages, currentPage, initialData.length, searchTerm]);


  const addItem = async (item: Omit<T, 'id' | 'createdAt'>): Promise<T> => {
    setIsLoading(true);
    return new Promise(resolve => {
      setTimeout(() => {
        const newItem = { ...item, id: generateMockId(), createdAt: new Date().toISOString() } as T;
        setData(prevData => [newItem, ...prevData]); // Add to beginning to see it first
        setIsLoading(false);
        resolve(newItem);
      }, 500);
    });
  };

  const updateItem = async (id: string, updatedItemData: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<T | null> => {
    setIsLoading(true);
    return new Promise(resolve => {
      setTimeout(() => {
        let foundItem: T | null = null;
        setData(prevData =>
          prevData.map(item => {
            if (item.id === id) {
              foundItem = { ...item, ...updatedItemData };
              return foundItem;
            }
            return item;
          })
        );
        setIsLoading(false);
        resolve(foundItem);
      }, 500);
    });
  };

  const deleteItem = async (id: string): Promise<void> => {
    setIsLoading(true);
    return new Promise(resolve => {
      setTimeout(() => {
        setData(prevData => prevData.filter(item => item.id !== id));
        setIsLoading(false);
        resolve();
      }, 500);
    });
  };

  const getItem = (id: string): T | undefined => {
    return data.find(item => item.id === id);
  };
  
  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const onSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on new search
  };

  return {
    paginatedData,
    currentPage,
    totalPages,
    totalItems: searchTerm ? paginatedData.length : data.length, // This needs refinement if search reduces items.
                                                               // It should be total filtered items
    isLoading,
    onPageChange,
    onSearch,
    setSearchTerm, // expose this for direct control if needed
    addItem,
    updateItem,
    deleteItem,
    getItem,
    itemsPerPage,
    originalDataCount: data.length, // to show total before filtering
  };
}
