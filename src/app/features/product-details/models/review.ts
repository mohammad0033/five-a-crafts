export interface Review {
  id: number;
  title: string;
  score: number;
  body: string;
  product: number;
  total_votes: number;
  num_up_votes: number;
  num_down_votes: number;
  user_name: string;
  date: string;
}
