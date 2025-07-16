// src/app/components/assessment-results-modal/assessment-results-modal.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assessment-results-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-results-modal.html',
  styleUrls: ['./assessment-results-modal.css']
})
export class AssessmentResultsModalComponent {
  @Input() correctCount = 0;
  @Input() incorrectCount = 0;
  
  @Output() restart = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  get totalCount(): number {
    return this.correctCount + this.incorrectCount;
  }

  get successPercentage(): number {
    if (this.totalCount === 0) return 0;
    return Math.round((this.correctCount / this.totalCount) * 100);
  }

  get performance(): { message: string; icon: string; color: string } {
    if (this.successPercentage >= 90) {
      return { message: '¡Excelente Trabajo!', icon: '🏆', color: 'text-yellow-400' };
    }
    if (this.successPercentage >= 70) {
      return { message: '¡Muy Bien! Sigue así.', icon: '👍', color: 'text-green-500' };
    }
    if (this.successPercentage >= 50) {
      return { message: 'No está mal, ¡a practicar!', icon: '💪', color: 'text-blue-500' };
    }
    return { message: 'Necesitas un poco más de práctica.', icon: '📚', color: 'text-red-500' };
  }
}