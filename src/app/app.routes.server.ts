import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'productos',
    renderMode: RenderMode.Client,
  },
  {
    path: 'productos/:slug',
    renderMode: RenderMode.Client,
  },
  {
    path: 'buscar',
    renderMode: RenderMode.Client,
  },
  {
    path: 'login',
    renderMode: RenderMode.Client,
  },
  {
    path: 'signup',
    renderMode: RenderMode.Client,
  },
  {
    path: 'confirm',
    renderMode: RenderMode.Client,
  },
  {
    path: 'recovery',
    renderMode: RenderMode.Client,
  },
  {
    path: 'reset',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
