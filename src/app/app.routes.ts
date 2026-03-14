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
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';
import { ViewWorkComponent } from './components/view-work/view-work.component';
import { AuthGuard } from './guards/auth.guard';
import { TermsComponent } from './components/terms/terms.component';
import { PrivacyComponent } from './components/privacy/privacy.component';

export const routes: Routes = [

  { path: '', component: HomeComponent },

  // 🔒 PROTECTED ROUTES
  { path: 'my-original-works', component: MyOriginalWorksComponent, canActivate: [AuthGuard] },
  { path: 'upload', component: UploadWorkComponent, canActivate: [AuthGuard] },
  { path: 'get-token', component: GetTokenComponent, canActivate: [AuthGuard] },
  { path: 'actions', component: ActionsAgainstPlagiaristsComponent, canActivate: [AuthGuard] },
  { path: 'account-info', component: MyAccountInfoComponent, canActivate: [AuthGuard] },
  { path: 'billing', component: BillingComponent, canActivate: [AuthGuard] },

  // Public routes
  { path: 'faq', component: FaqComponent },
  { path: 'verify', component: VerifyWorkComponent },
  { path: 'view-register-work', component: ViewWorkDetailsComponent },
  { path: 'pricing', component: PricingComponent },
  { path: 'highlight', component: HighlightComponent },
  { path: 'contact', component: ContactUsComponent },
  { path: 'billing/success', component: PaymentSuccessComponent },
  { path: 'share/:shareId', component: ViewWorkComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterUserComponent },

  { path: '**', redirectTo: '' },
];

