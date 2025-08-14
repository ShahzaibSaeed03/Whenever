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
  loginUrl = 'users/login'
  registerUrl = 'users'
  uploadfile='works/upload'
  worklist='works'
  constructor(private http: HttpClient) { }
 authToken= localStorage.getItem('token')
  getWorks(): Observable<Work[]> {
    return this.http.get<Work[]>(this.apiUrl);
  }
  updatePassword(id: number, password: string): Observable<Work> {
    return this.http.patch<Work>(`${this.apiUrl}/${id}`, { password });
  }

  // Delete work by ID
  deleteWork(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Update work title (edit functionality)
  updateTitle(id: number, title: string): Observable<Work> {
    return this.http.patch<Work>(`${this.apiUrl}/${id}`, { title });
  }
getWorkByIds(): Observable<any> {
  const token = localStorage.getItem('token'); // Assuming the token is stored under 'authToken'
  const headers = new HttpHeaders({
    Authorization: token ? `Bearer ${token}` : ''
  });
  console.log(`Calling API: ${this.apiUrl}shares/access/7829401cf976f5abf07da21ec72df32165fcb3ed71b3842bd0d130823e8e115b`);

  return this.http.get<any>(`${this.apiUrl}shares/access/7829401cf976f5abf07da21ec72df32165fcb3ed71b3842bd0d130823e8e115b`, { headers });
}


getWorkById(id: any): Observable<Work> {
  // Retrieve the token from localStorage
  const token = localStorage.getItem('token'); // Assuming the token is stored under 'authToken'

  // If the token is available, include it in the headers
  const headers = new HttpHeaders({
    Authorization: token ? `Bearer ${token}` : ''
  });

  // Make the request with the Authorization header
  return this.http.get<Work>(`${this.apiUrl}works/user/${id}`, { headers });
}

  login(body: any) {
    return this.http.post(this.apiUrl + this.loginUrl, body)
  }
  register(body: any) {
    return this.http.post(this.apiUrl + this.registerUrl, body)
  }
  uploadedfileed( file: File, workTitle: string, additionalOwners: string, copyrightOwner: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('workTitle', workTitle);
    formData.append('additionalOwners', additionalOwners);
    formData.append('copyrightOwner', copyrightOwner);

    const headers = new HttpHeaders({
      Authorization: this.authToken ? "Bearer "+this.authToken : '',
 
    });

    return this.http.post(this.apiUrl+this.uploadfile, formData, { headers });
  }
  getworklist(){
    const headers = new HttpHeaders({
      Authorization: this.authToken ? "Bearer "+this.authToken : '',
 
    });
    return this.http.get(this.apiUrl+this.worklist,{headers})
  }

verifyWork(formData: FormData): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: this.authToken ? 'Bearer ' + this.authToken : '',
  });

  return this.http.post(this.apiUrl + 'works/verify', formData, { headers });
}
 shareWork(workId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
    });

    return this.http.post(`${this.apiUrl}shares/create`, { workId }, { headers });
  }

}


// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';

// const BASE_URL = 'http://13.62.76.118/api';

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   constructor(private http: HttpClient) {}

//   login(payload: { email: string }): Observable<any> {
//     return this.http.post(`${BASE_URL}/users/login`, payload);
//   }

