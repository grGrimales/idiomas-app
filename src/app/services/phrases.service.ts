import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Phrase } from './playlists.service'; // La ruta ahora es local a la carpeta 'services'
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PhrasesService {
  private apiUrl =  `${environment.backendUrl}`;

  constructor(private http: HttpClient) { }

  getPhrasesWithMissingAudio(sortBy: string = 'createdAt_desc', playlistId?: string): Observable<Phrase[]> {



    let params = new HttpParams().set('sortBy', sortBy);
    if (playlistId) {
      params = params.set('playlistId', playlistId);
    }
    return this.http.get<Phrase[]>(`${this.apiUrl}/phrases/missing-audio`, { params });
  }

  deleteAudio(phraseId: string, translationIndex: number, gender: string): Observable<Phrase> {
    return this.http.delete<Phrase>(`${this.apiUrl}/phrases/${phraseId}/translations/${translationIndex}/audio/${gender}`);
  }

  uploadAudio(phraseId: string, translationIndex: number, gender: string, file: File): Observable<Phrase> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    // Corregido: Usar 'translationIndex'
    const url = `${this.apiUrl}/phrases/${phraseId}/translations/${translationIndex}/audio/${gender}`;
    return this.http.patch<Phrase>(url, formData);
  }

  getAllPhrases(): Observable<Phrase[]> {
    return this.http.get<Phrase[]>(this.apiUrl + '/phrases');
  }

  getPhraseForAssessment(): Observable<Phrase> {
    return this.http.get<Phrase>(`${this.apiUrl}/phrases/assessment/random`);
  }

  uploadOriginAudio(phraseId: string, file: File): Observable<Phrase> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.patch<Phrase>(`${this.apiUrl}/phrases/${phraseId}/origin-audio`, formData);
  }

  updateAssessmentStats(phraseId: string, isCorrect: boolean): Observable<any> {
    const body = { phraseId, isCorrect };
    return this.http.post(`${this.apiUrl}/statistics`, body);
  }

  createAssessmentSession(config: any): Observable<Phrase[]> {
    return this.http.post<Phrase[]>(`${this.apiUrl}/phrases/assessment-session`, config);
  }

  createDeepStudySession(config: any): Observable<Phrase[]> {
    return this.http.post<Phrase[]>(`${this.apiUrl}/phrases/deep-study-session`, config);
  }

  incrementRelaxListen(phraseId: string): Observable<any> {
    console.log('Incrementing relax listen count for phrase:', phraseId);
    return this.http.post(`${this.apiUrl}/statistics/relax-listen/${phraseId}`, {});
  }

  createRelaxSession(config: any): Observable<Phrase[]> {
    return this.http.post<Phrase[]>(`${this.apiUrl}/phrases/relax-session`, config);
  } 


  }