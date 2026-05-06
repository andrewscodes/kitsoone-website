import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { ProductsComponent } from './components/products/products.component';
import { ProductComponent } from './components/product/product.component';
import { WarrantyComponent } from './components/policies/warranty/warranty.component';
import { TermsOfServiceComponent } from './components/policies/terms/terms.component';
import { ShippingComponent } from './components/policies/shipping/shipping.component';
import { ContactComponent } from './components/contact/contact.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'acerca', component: AboutComponent },
  { path: 'productos', component: ProductsComponent },
  { path: 'productos/:id', component: ProductComponent },
  { path: 'garantia', component: WarrantyComponent },
  { path: 'envios', component: ShippingComponent },
  { path: 'terminos', component: TermsOfServiceComponent },
  { path: 'contacto', component: ContactComponent },
  { path: '**', redirectTo: '' },
];
