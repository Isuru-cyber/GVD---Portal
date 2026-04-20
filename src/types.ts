export type UserRole = 'Admin' | 'Entry User' | 'Viewer';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  plant?: string;
  category?: 'GRN' | 'Dispatched' | 'Waste' | 'All';
  created_at: string;
}

export interface ProductionRecord {
  id: string;
  plant: string;
  year: number;
  month: number;
  grn: number;
  dispatched: number;
  waste: number;
  created_by: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  username: string;
  action: string;
  plant: string;
  timestamp: string;
}

export const PLANTS = ['STR 1', 'STR 2', 'CP', 'YD'];
export const CATEGORIES = ['GRN', 'Dispatched', 'Waste'];
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export interface DashboardMetrics {
  totalGrn: number;
  totalDispatched: number;
  totalWaste: number;
  totalBalance: number;
  overallUtilization: number;
}
