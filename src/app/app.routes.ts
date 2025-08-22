import { Routes } from '@angular/router';
import { MyOriginalWorksComponent } from './components/my-original-works/my-original-works.component';
import { UploadWorkComponent } from './components/upload-work/upload-work.component';
import { VerifyWorkComponent } from './components/verify-work/verify-work.component';
import { UploadFAQComponent } from './components/upload-faq/upload-faq.component';

import { LoginComponent } from './components/login/login.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';
import { ViewWorkDetailsComponent } from './components/view-work-details/view-work-details.component';
import { AuthGuard } from './guards/auth.guard'; // your fixed auth guard

export const routes: Routes = [
  // Redirect root to upload if logged in, else to login
  { path: '', pathMatch: 'full', redirectTo: localStorage.getItem('userId') ? 'upload' : 'login' },

  // Auth-protected routes
  { path: 'upload', component: UploadWorkComponent, canActivate: [AuthGuard] },
  { path: 'my-original-works', component: MyOriginalWorksComponent, canActivate: [AuthGuard] },

  // Public routes
  { path: 'upload-faq', component: UploadFAQComponent },
  { path: 'verify', component: VerifyWorkComponent },
{ path: 'view-work/:workId', component: ViewWorkDetailsComponent },

  // Authentication routes
  { path: 'login', component: LoginComponent },
  { path: 'registerUser', component: RegisterUserComponent },

  // Fallback
  { path: '**', redirectTo: 'upload' },
];
