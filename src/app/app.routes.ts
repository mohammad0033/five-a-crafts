import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/components/container/container.component').then((m) => m.ContainerComponent),
    children: []
  },
  {
    path: '**',
    redirectTo: '',
  }
];
