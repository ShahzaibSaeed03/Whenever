import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

export interface Work {
  id: number;
  title: string;
  certificateUrl: string;
  fileUrl: string;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class WorkService {

  private apiUrl = environment.apiUrl;
  private loginUrl = '/users/login';
  private registerUrl = '/users';
  private uploadFileUrl = '/works/upload';
  private workListUrl = '/works';

  constructor(private http: HttpClient) { }

  /* ================= WORKS ================= */

  getWorks(): Observable<Work[]> {
    return this.http.get<Work[]>(`${this.apiUrl}${this.workListUrl}`);
  }

  getWorkById(id: any): Observable<Work> {
    return this.http.get<Work>(`${this.apiUrl}/works/user/${id}`);
  }

  updatePassword(id: number, password: string): Observable<Work> {
    return this.http.patch<Work>(`${this.apiUrl}${this.workListUrl}/${id}`, { password });
  }

  updateTitle(id: number, title: string): Observable<Work> {
    return this.http.patch<Work>(`${this.apiUrl}${this.workListUrl}/${id}`, { title });
  }

  deleteWork(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${this.workListUrl}/${id}`);
  }

  /* ================= UPLOAD ================= */

  uploadFile(file: File, workTitle: string, additionalOwners: string, copyrightOwner: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('workTitle', workTitle);
    formData.append('additionalOwners', additionalOwners);
    formData.append('copyrightOwner', copyrightOwner);

    return this.http.post(`${this.apiUrl}${this.uploadFileUrl}`, formData);
  }

  verifyWork(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/works/verify`, formData);
  }

  /* ================= AUTH ================= */

  login(body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}${this.loginUrl}`, body);
  }

  register(body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}${this.registerUrl}`, body);
  }

  /* ================= LIST ================= */

  getWorkList(): Observable<any> {
    return this.http.get(`${this.apiUrl}${this.workListUrl}`);
  }

  getWorkByIds(workId: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/shares/access/${workId}`, { password });
  }

  /* ================= SHARE ================= */

  shareWork(workId: string, password: string) {
    return this.http.post(`${this.apiUrl}/shares/create`, { workId, password });
  }

  accessByReference(reference: string, password: string) {
    return this.http.post(`${this.apiUrl}/shares/access-by-reference`, { reference, password });
  }

  listShares(workId: string) {
    return this.http.get(`${this.apiUrl}/shares/list/${workId}`);
  }

  deleteShare(shareId: string) {
    return this.http.delete(`${this.apiUrl}/shares/${shareId}`);
  }

  setPassword(workId: string, password: string) {
    return this.http.post(`${this.apiUrl}/shares/set-password`, { workId, password });
  }

  createLink(workId: string) {
    return this.http.post(`${this.apiUrl}/shares/create-link`, { workId });
  }

  accessShared(id: string, password: string) {
    return this.http.post(`${this.apiUrl}/shares/access/${id}`, { password });
  }

  /* ================= TOKENS / SUBSCRIPTION ================= */

  getTokenDetails(): Observable<any> {
    return this.http.get(`${this.apiUrl}/subscription/status`);
  }
  verifyShare(shareId: string, password: string) {
    return this.http.post(`${this.apiUrl}/shares/${shareId}`, { password })
  }
}