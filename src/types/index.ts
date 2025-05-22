
export interface User {
  id: string;
  fullName: string; // Changed from name
  username: string; // Changed from email for login, actual email might be separate or same as username
  role: 'admin' | 'staff' | string; // Allow string for flexibility if API returns other roles
  password?: string; // Only for creation/update, not for display
  confirm_password?: string; // Only for creation/update
  createdAt?: string; // ISO date string, from API
}

export interface Table {
  id: string;
  name: string;
  description?: string; // Added
  capacity: number;
  photo?: string; // Added, URL to image
  status?: 'available' | 'occupied' | 'reserved' | 'maintenance'; // Keep for UI if API returns it on GET
  createdAt?: string; // ISO date string, from API
}

export interface Reservation {
  id: string;
  tableId: string;
  tableName?: string; // For display convenience, if joined by backend or fetched separately
  date: string; // Format: YYYY-MM-DD
  hour: string; // Format: HH:MM
  duration: number; // in minutes or hours, API dependent
  people: number;
  phone: string;
  description?: string; // Was notes
  // Fields removed based on API: customerName, customerEmail (could be part of description or separate if API changes)
  status?: 'confirmed' | 'pending' | 'cancelled' | 'completed' | string; // From API on GET
  createdAt?: string; // ISO date string, from API

  // For form binding, might be different from submission
  customerName?: string; // Keep for form if needed, then map to description or handle
  customerEmail?: string; // Keep for form
  dateTime?: string | Date; // For form date picker, to be converted
}

export interface MenuItem {
  id: string;
  image?: string; // Was imageUrl
  title: string; // Was name
  description: string;
  fee: number; // Was price
  available: boolean; // Added
  categoryId: string;
  categoryName?: string; // For display convenience
  createdAt?: string; // ISO date string, from API
  // tags removed as not in API spec
}

export interface Category {
  id: string;
  name: string;
  icon?: string; // Changed from description (URL to icon image)
  createdAt?: string; // ISO date string, from API
}

export interface ManagedImage {
  id: string;
  name: string; // Was filename
  alt?: string; // Was altText
  image: string; // Was url, this is the image URL or base64 data based on API behavior
  uploadedAt?: string; // From API, was uploadedAt
}

// API Auth Types
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  // Assuming API might also return user details on login for convenience
  user?: {
    id: string;
    fullName: string;
    username: string;
    role: string;
  };
}
