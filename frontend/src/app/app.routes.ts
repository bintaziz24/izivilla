import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PropertiesComponent } from './components/properties/properties.component';
import { PropertyDetailComponent } from './components/property-detail/property-detail.component';
import { AgencyListComponent } from './components/agency-list/agency-list.component';
import { AgencyDashboardComponent } from './components/agency-dashboard/agency-dashboard.component';
import { CreatePropertyComponent } from './components/create-property/create-property.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { TenantDashboardComponent } from './components/tenant-dashboard/tenant-dashboard.component';
import { HowItWorksComponent } from './components/how-it-works/how-it-works.component';
import { AboutComponent } from './components/about/about.component';

import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'annonces', component: PropertiesComponent },
  { path: 'annonces/:id', component: PropertyDetailComponent },
  { path: 'agencies', component: AgencyListComponent },
  { path: 'comment-ca-marche', component: HowItWorksComponent },
  { path: 'a-propos', component: AboutComponent },
  { path: 'dashboard', component: AgencyDashboardComponent, canActivate: [authGuard] },
  { path: 'espace-proprietaire', component: AgencyDashboardComponent, canActivate: [authGuard] },
  { path: 'espace-agence', component: AgencyDashboardComponent, canActivate: [authGuard] },
  { path: 'deposer-annonce', component: CreatePropertyComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard], data: { role: 'admin' } },
  { path: 'espace-locataire', component: TenantDashboardComponent, canActivate: [authGuard] },
  { path: 'mes-demandes', component: TenantDashboardComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];



