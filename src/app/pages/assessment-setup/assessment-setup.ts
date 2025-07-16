import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PhrasesService } from '../../services/phrases.service';
import { AssessmentService } from '../../services/assessment.service';
import { Playlist, PlaylistsService } from '../../services/playlists.service';

@Component({
  selector: 'app-assessment-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessment-setup.html',
})
export class AssessmentSetupComponent implements OnInit {
  playlists: Playlist[] = [];
  config = {
    playlistId: undefined,
    orderBy: 'random',
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

  startAssessment(): void {
    this.phrasesService.createAssessmentSession(this.config).subscribe(phrases => {
      console.log('Frases para la evaluación:', phrases);
      if (phrases && phrases.length > 0) {
        console.log('Iniciando sesión de evaluación...');
        this.assessmentService.setPhrases(phrases);
        this.router.navigate(['/self-assessment']); // Navega a la evaluación
      } else {
        alert('No se encontraron frases con los filtros seleccionados.');
      }
    });
  }
}