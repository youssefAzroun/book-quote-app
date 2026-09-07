export interface Book {
  id: number;
  title: string;
  author: string;
  publicationDate: string;
}

export interface BookRequest {
  title: string;
  author: string;
  publicationDate: string;
}
