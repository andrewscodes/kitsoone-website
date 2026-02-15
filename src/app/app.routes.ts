import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { ProductsComponent } from './components/products/products.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'acerca-de', component: AboutComponent },
  { path: 'productos', component: ProductsComponent },
  { path: '**', redirectTo: '' },
];
