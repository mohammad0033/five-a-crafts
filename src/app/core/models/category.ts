export interface Category {
  id: number;
  url: string;
  breadcrumbs: string;
  children: string;
  name: string;
  description: string;
  image: string;
  meta_title: string;
  meta_description: string;
  get_num_children: number;
  childrens: any[];
  slug: string;
}
