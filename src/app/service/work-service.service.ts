import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Work {
  id: number;
  title: string;
  certificateUrl: string;
  fileUrl: string;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class WorkService {
  private apiUrl = 'https://api.mycopyrightally.com/api/';
  private loginUrl = 'users/login';
  private registerUrl = 'users';
  private uploadFileUrl = 'works/upload';
  private workListUrl = 'works';

  constructor(private http: HttpClient) {}

  // Retrieve the token from localStorage
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  // Helper function to set headers
  private setHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  // Get the list of works
  getWorks(): Observable<Work[]> {
    return this.http.get<Work[]>(`${this.apiUrl}${this.workListUrl}`, {
      headers: this.setHeaders()
    });
  }

  // Get a specific work by ID
  getWorkById(id:any): Observable<Work> {
    return this.http.get<Work>(`${this.apiUrl}works/user/${id}`, {
      headers: this.setHeaders()
    });
  }

  // Update work password
  updatePassword(id: number, password: string): Observable<Work> {
    return this.http.patch<Work>(`${this.apiUrl}${this.workListUrl}/${id}`, { password }, {
      headers: this.setHeaders()
    });
  }

  // Update work title
  updateTitle(id: number, title: string): Observable<Work> {
    return this.http.patch<Work>(`${this.apiUrl}${this.workListUrl}/${id}`, { title }, {
      headers: this.setHeaders()
    });
  }

  // Delete a work by ID
  deleteWork(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${this.workListUrl}/${id}`, {
      headers: this.setHeaders()
    });
  }

  // File upload
  uploadFile(file: File, workTitle: string, additionalOwners: string, copyrightOwner: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('workTitle', workTitle);
    formData.append('additionalOwners', additionalOwners);
    formData.append('copyrightOwner', copyrightOwner);

    return this.http.post(`${this.apiUrl}${this.uploadFileUrl}`, formData, {
      headers: this.setHeaders()
    });
  }

  // Verify work
  verifyWork(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}works/verify`, formData, {
      headers: this.setHeaders()
    });
  }

  // Share work
  shareWork(workId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}shares/create`, { workId }, {
      headers: this.setHeaders()
    });
  }

  // Login
  login(body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}${this.loginUrl}`, body);
  }

  // Register
  register(body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}${this.registerUrl}`, body);
  }

  // Get work list
  getWorkList(): Observable<any> {
    return this.http.get(`${this.apiUrl}${this.workListUrl}`, {
      headers: this.setHeaders()
    });
  }

  // Retrieve work access data
  getWorkByIds(workId:any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}shares/access/${workId}`, {
      headers: this.setHeaders()
    });
  }
}
