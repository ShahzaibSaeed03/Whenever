import { Routes } from '@angular/router';
import { MyOriginalWorksComponent } from './components/my-original-works/my-original-works.component';
import { UploadWorkComponent } from './components/upload-work/upload-work.component';
import { VerifyWorkComponent } from './components/verify-work/verify-work.component';
import { UploadFAQComponent } from './components/upload-faq/upload-faq.component';
import { CertificateDisplayComponent } from './components/certificate-display/certificate-display.component';
import { CertificatePrintComponent } from './components/certificate-print/certificate-print.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterUserComponent } from './components/register-user/register-user.component';


export const routes: Routes = [
  { path: '', redirectTo: 'registerUser', pathMatch: 'full' },
  { path: 'upload', component: UploadWorkComponent },
  { path: 'upload-faq', component: UploadFAQComponent },
  { path: 'certificate', component: CertificateDisplayComponent },
  { path: 'verify', component: VerifyWorkComponent },
  { path: 'my-original-works', component: MyOriginalWorksComponent },
  { path: 'certificate-print/:id', component: CertificatePrintComponent },
  {path:'login',component:LoginComponent},
  {path:'registerUser',component:RegisterUserComponent},
  { path: '**', redirectTo: 'upload' } // fallback route (404 → redirect to upload)
];
