import { Routes } from '@angular/router';
import { MyOriginalWorksComponent } from './components/my-original-works/my-original-works.component';
import { UploadWorkComponent } from './components/upload-work/upload-work.component';
import { VerifyWorkComponent } from './components/verify-work/verify-work.component';
import { UploadFAQComponent } from './components/upload-faq/upload-faq.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { ViewWorkDetailsComponent } from './components/view-work-details/view-work-details.component';
import { HomeComponent } from './components/home/home.component';
import { GetTokenComponent } from './components/get-token/get-token.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { HighlightComponent } from './components/highlight/highlight.component';
import { ActionsAgainstPlagiaristsComponent } from './components/actions-against-plagiarists/actions-against-plagiarists.component';
import { FaqComponent } from './components/faq/faq.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { MyAccountInfoComponent } from './components/my-account-info/my-account-info.component';
import { BillingComponent } from './components/billing/billing.component';

export const routes: Routes = [
  // Root → HomeComponent (PUBLIC)
  // { path: '', component: HomeComponent },
  { path: '', component: HomeComponent },

  // Auth-protected routes
  { path: 'my-original-works', component: MyOriginalWorksComponent },

  // Public routes
  { path: 'upload', component: UploadWorkComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'verify', component: VerifyWorkComponent },
  { path: 'view-register-work', component: ViewWorkDetailsComponent },
  { path: "get-token", component: GetTokenComponent },
  { path: "pricing", component: PricingComponent },
  { path: 'highlight', component: HighlightComponent },
  { path: 'actions', component: ActionsAgainstPlagiaristsComponent },
  { path: "contact", component: ContactUsComponent },
  { path: "account-info", component: MyAccountInfoComponent },
  { path: "billing", component: BillingComponent },
  // Authentication
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterUserComponent },

  // Fallback
  { path: '**', redirectTo: '' },
];

