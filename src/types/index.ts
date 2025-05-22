
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  createdAt: string; // ISO date string
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  createdAt: string; // ISO date string
}

export interface Reservation {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  tableId: string;
  tableName?: string; // For display convenience
  dateTime: string; // ISO date string
  guests: number;
  notes?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: string; // ISO date string
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName?: string; // For display convenience
  imageUrl?: string;
  createdAt: string; // ISO date string
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // ISO date string
}

export interface ManagedImage {
  id: string;
  url: string;
  altText?: string;
  filename?: string;
  uploadedAt: string; // ISO date string
}
