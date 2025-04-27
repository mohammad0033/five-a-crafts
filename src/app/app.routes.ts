import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/components/container/container.component').then((m) => m.ContainerComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/components/container/home.component').then(
            (m) => m.HomeComponent
          ),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/about/components/container/about.component').then(
            (m) => m.AboutComponent
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/components/container/categories.component').then(
            (m) => m.CategoriesComponent
          ),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/contact/components/container/contact.component').then(
            (m) => m.ContactComponent
          ),
      },
      {
        path: 'favorites',
        loadComponent: () =>
          import('./features/favorites/components/container/favorites.component').then(
            (m) => m.FavoritesComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/components/container/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./features/cart/components/container/cart.component').then(
            (m) => m.CartComponent
          ),
      },
    ]
  },
  {
    path: '**',
    redirectTo: '',
  }
];
