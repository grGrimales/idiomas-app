// src/app/services/assessment.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Phrase } from './playlists.service';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private phrasesSource = new BehaviorSubject<Phrase[]>([]);
  phrases$ = this.phrasesSource.asObservable();

  setPhrases(phrases: Phrase[]) {
    this.phrasesSource.next(phrases);
  }
}