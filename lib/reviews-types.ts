export type ReviewQuote = {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
};

export type ReviewStats = { average: number; count: number };
