// fe-src/app/services/playlists.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Definimos las interfaces aquí si no están en otro lado
export interface Playlist {
  _id: string;
  name: string;
}

export interface Audio {
  gender: string;
  audioUrl: string;
}

export interface Translation {
  language: string;
  translatedText: string;
  imageUrl: string;
  audios: Audio[];
}

export interface Phrase {
  _id: string;
  originalText: string;
  originAudioUrl?: string;
  level: 'basico' | 'intermedio' | 'avanzado';
  createdBy: any;
  translations: Translation[];
  hasProblem?: boolean;
}

export interface Group {
  _id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistsService {
  private apiUrl =  `${environment.backendUrl}/playlists`;

  constructor(private http: HttpClient) { }

  getPlaylists(): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(this.apiUrl);
  }

  getUserPlaylists(): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.apiUrl}/user`);
  }


   getGroupsByPlaylistId(playlistId: string): Observable<Group[]> {

    return this.http.get<Group[]>(`${this.apiUrl}/${playlistId}/groups`);
  }
}