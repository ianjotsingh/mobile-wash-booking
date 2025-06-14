
import { useState, useMemo } from 'react';

interface Company {
  id: string;
  company_name: string;
  city: string;
  base_price: number;
  rating?: number;
  distance?: number;
  available?: boolean;
  services?: string[];
}

interface FilterState {
  search: string;
  priceRange: string;
  rating: string;
  distance: string;
  availability: string;
  sortBy: string;
}

const initialFilters: FilterState = {
  search: '',
  priceRange: '',
  rating: '',
  distance: '',
  availability: '',
  sortBy: 'relevance'
};

export const useProviderFilters = (companies: Company[]) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = [...companies];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(company =>
        company.company_name.toLowerCase().includes(searchTerm) ||
        company.city.toLowerCase().includes(searchTerm) ||
        company.services?.some(service => service.toLowerCase().includes(searchTerm))
      );
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(company => {
        const price = company.base_price / 100; // Convert from paise
        switch (filters.priceRange) {
          case 'low': return price < 300;
          case 'medium': return price >= 300 && price <= 500;
          case 'high': return price > 500;
          default: return true;
        }
      });
    }

    // Rating filter
    if (filters.rating) {
      filtered = filtered.filter(company => {
        const rating = company.rating || 0;
        switch (filters.rating) {
          case '4+': return rating >= 4;
          case '4.5+': return rating >= 4.5;
          case '5': return rating >= 5;
          default: return true;
        }
      });
    }

    // Distance filter
    if (filters.distance) {
      const maxDistance = parseFloat(filters.distance);
      filtered = filtered.filter(company => 
        !company.distance || company.distance <= maxDistance
      );
    }

    // Availability filter
    if (filters.availability) {
      filtered = filtered.filter(company => {
        switch (filters.availability) {
          case 'now':
          case 'today':
          case 'tomorrow':
            return company.available !== false;
          default:
            return true;
        }
      });
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_low':
          return a.base_price - b.base_price;
        case 'price_high':
          return b.base_price - a.base_price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'availability':
          return (b.available ? 1 : 0) - (a.available ? 1 : 0);
        case 'relevance':
        default:
          return 0;
      }
    });

    return filtered;
  }, [companies, filters]);

  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => 
      value && key !== 'sortBy'
    ).length;
  }, [filters]);

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return {
    filters,
    setFilters,
    filteredCompanies: filteredAndSortedCompanies,
    activeFiltersCount,
    clearFilters
  };
};
