import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlaylistsService, Playlist } from '../../services/playlists.service';
import { PhrasesService } from '../../services/phrases.service';
import { AssessmentService } from '../../services/assessment.service';

@Component({
  selector: 'app-deep-study-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deep-study-setup.html',
})
export class DeepStudySetupComponent implements OnInit {
  playlists: Playlist[] = [];
  config = {
    playlistId: undefined,
    orderBy: 'least_studied',
    limit: 10
  };

  constructor(
    private playlistsService: PlaylistsService,
    private phrasesService: PhrasesService,
    private assessmentService: AssessmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.playlistsService.getPlaylists().subscribe(data => this.playlists = data);
  }

  startStudySession(): void {
    this.phrasesService.createDeepStudySession(this.config).subscribe(phrases => {
      if (phrases && phrases.length > 0) {
        this.assessmentService.setPhrases(phrases);
        this.router.navigate(['/deep-study-view']);
      } else {
        alert('No se encontraron frases con los filtros seleccionados.');
      }
    });
  }
}