export interface Realtor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  bio: string;
  image_url: string;
  companyName: string;
  rating?: number;
  languages?: string[];
  location: string;
  island: 'bonaire' | 'aruba' | 'curacao';
  userId?: string;
}

export interface RealtorUpload {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  bio: string;
  image_url: string;
  companyName: string;
  rating?: number;
  languages?: string[];
  location: string;
  island: 'bonaire' | 'aruba' | 'curacao';
}
