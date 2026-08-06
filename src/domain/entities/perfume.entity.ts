export interface Perfume {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  basePrice: number;
  imageUrl: string | null;
  isActive: boolean;
}
