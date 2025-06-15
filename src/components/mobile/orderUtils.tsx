
// Utility functions for mobile order history

export const formatPrice = (priceInPaise: number): string => {
  if (!priceInPaise || priceInPaise === 0) {
    return 'Yet to confirm';
  }
  return `₹${Math.floor(priceInPaise / 100)}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusIcon = (status: string, icons: any) => {
  const { Star, Clock, Car, Calendar } = icons;
  switch (status) {
    case 'completed':
      return <Star className="h-4 w-4 text-green-600" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'in_progress':
      return <Car className="h-4 w-4 text-blue-600" />;
    default:
      return <Calendar className="h-4 w-4 text-gray-600" />;
  }
};
