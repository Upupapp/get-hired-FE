export interface Credentials {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password? : string;
  role?: number;
  photoUrl?: string;
  token?: string;
  refreshToken?: string;
}



export interface MainProduct {
  id: string;
  name: string;
  images: Image[];
  availableForSale: boolean;
  createdAt: Date;
  updatedAt: Date;
  description: string;
  handle: string;
  productType: string;
  title: string;
  vendor: string;
}

export interface Image {
  src: string;
  altText: string;
}
