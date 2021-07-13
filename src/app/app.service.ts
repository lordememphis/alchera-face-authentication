import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private readonly headers = {
    uid: '7e93e693-e277-403f-99a5-952ffa0a4808',
    'x-rapidapi-key': `${environment.X_RAPID_API_KEY}`,
    'x-rapidapi-host': `${environment.X_RAPID_API_HOST}`,
  };

  constructor(private http: HttpClient) {}

  registerFace(data: any): Observable<any> {
    return this.http.post(`${environment.BASE_URL}`, data, {
      headers: this.headers,
    });
  }

  updateFace(data: any): Observable<any> {
    return this.http.put(`${environment.BASE_URL}`, data, {
      headers: this.headers,
    });
  }

  deleteFace(): Observable<any> {
    return this.http.delete(`${environment.BASE_URL}`, {
      headers: this.headers,
    });
  }

  compareFace(data: any): Observable<any> {
    return this.http.post(`${environment.BASE_URL}/compare`, data, {
      headers: this.headers,
    });
  }

  recogniseFace(data: any): Observable<any> {
    return this.http.post(`${environment.BASE_URL}/match`, data, {
      headers: this.headers,
    });
  }
}
