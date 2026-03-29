import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { ProductsComponent } from './components/products/products.component';
import { WarrantyComponent } from './components/warranty/warranty.component';
import { TermsOfServiceComponent } from './components/terms-of-service/terms-of-service.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'acerca-de', component: AboutComponent },
  { path: 'productos', component: ProductsComponent },
  { path: 'garantia', component: WarrantyComponent },
  { path: 'terminos', component: TermsOfServiceComponent },
  { path: '**', redirectTo: '' },
];
