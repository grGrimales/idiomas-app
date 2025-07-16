// fe-src/app/services/statistics.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';


@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
 //private baseUrl = 'http://localhost:3000';
private baseUrl = `${environment.backendUrl}`; 
  constructor(private http: HttpClient) { }

  incrementDeepStudyCount(phraseId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/statistics/deep-study/${phraseId}`, {});
  }
}