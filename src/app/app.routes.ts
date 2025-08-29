import { Routes } from '@angular/router';
import { MyOriginalWorksComponent } from './components/my-original-works/my-original-works.component';
import { UploadWorkComponent } from './components/upload-work/upload-work.component';
import { VerifyWorkComponent } from './components/verify-work/verify-work.component';
import { UploadFAQComponent } from './components/upload-faq/upload-faq.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { ViewWorkDetailsComponent } from './components/view-work-details/view-work-details.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Root → UploadWorkComponent (protected)
  { path: '', component: UploadWorkComponent, canActivate: [AuthGuard] },

  // Auth-protected routes
  { path: 'my-original-works', component: MyOriginalWorksComponent, canActivate: [AuthGuard] },

  // Public routes
  { path: 'upload-faq', component: UploadFAQComponent },
  { path: 'verify', component: VerifyWorkComponent },
  { path: 'view-work/:workId', component: ViewWorkDetailsComponent },

  // Authentication
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterUserComponent },

  // Fallback
  { path: '**', redirectTo: '' },
];
