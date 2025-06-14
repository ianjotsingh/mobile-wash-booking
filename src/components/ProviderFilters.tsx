
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, MapPin, Star, Clock, DollarSign } from 'lucide-react';

interface FilterState {
  search: string;
  priceRange: string;
  rating: string;
  distance: string;
  availability: string;
  sortBy: string;
}

interface ProviderFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const ProviderFilters = ({ filters, onFiltersChange, onClearFilters, activeFiltersCount }: ProviderFiltersProps) => {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const filterOptions = [
    {
      key: 'priceRange' as keyof FilterState,
      label: 'Price Range',
      icon: DollarSign,
      options: [
        { value: '', label: 'Any Price' },
        { value: 'low', label: 'Under ₹300' },
        { value: 'medium', label: '₹300 - ₹500' },
        { value: 'high', label: 'Above ₹500' }
      ]
    },
    {
      key: 'rating' as keyof FilterState,
      label: 'Rating',
      icon: Star,
      options: [
        { value: '', label: 'Any Rating' },
        { value: '4+', label: '4+ Stars' },
        { value: '4.5+', label: '4.5+ Stars' },
        { value: '5', label: '5 Stars' }
      ]
    },
    {
      key: 'distance' as keyof FilterState,
      label: 'Distance',
      icon: MapPin,
      options: [
        { value: '', label: 'Any Distance' },
        { value: '2', label: 'Within 2 km' },
        { value: '5', label: 'Within 5 km' },
        { value: '10', label: 'Within 10 km' }
      ]
    },
    {
      key: 'availability' as keyof FilterState,
      label: 'Availability',
      icon: Clock,
      options: [
        { value: '', label: 'Any Time' },
        { value: 'now', label: 'Available Now' },
        { value: 'today', label: 'Available Today' },
        { value: 'tomorrow', label: 'Available Tomorrow' }
      ]
    }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'distance', label: 'Nearest First' },
    { value: 'availability', label: 'Available First' }
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Search Bar */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search providers by name, location, or specialization..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center space-x-2 h-12"
            disabled={activeFiltersCount === 0}
          >
            <Filter className="h-4 w-4" />
            <span>Clear</span>
            {activeFiltersCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filter Options */}
        <div className="flex flex-wrap items-center gap-4">
          {filterOptions.map(({ key, label, icon: Icon, options }) => (
            <div key={key} className="flex items-center space-x-2">
              <Icon className="h-4 w-4 text-gray-500" />
              <Select value={filters[key]} onValueChange={(value) => updateFilter(key, value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent>
                  {options.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* Sort By */}
          <div className="flex items-center space-x-2 ml-auto">
            <span className="text-sm text-gray-600">Sort by:</span>
            <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-sm text-gray-600">Active filters:</span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value || key === 'search' || key === 'sortBy') return null;
              
              const option = filterOptions.find(f => f.key === key);
              const optionValue = option?.options.find(o => o.value === value);
              
              return (
                <Badge key={key} variant="secondary" className="flex items-center space-x-1">
                  <span>{optionValue?.label || value}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => updateFilter(key as keyof FilterState, '')}
                  />
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderFilters;
