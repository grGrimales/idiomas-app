import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common'; // 👈 necesario para *ngIf
import { Router } from '@angular/router';
import { GoogleSheetService } from '../../app/services/GoogleSheetService';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  showDropdown = false;
  constructor(private router: Router, private sheetService: GoogleSheetService) {}

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  refreshData(nombreHoja: string) {
    this.sheetService.refreshCsvData(nombreHoja).subscribe(() => {
      alert(`Datos de la hoja "${nombreHoja}" actualizados correctamente`);
    });
  }
  
  navigate(route: string) {
    this.router.navigateByUrl(route);
    this.showDropdown = false; // también cierra el dropdown
  }

  @HostListener('document:click', ['$event'])
handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  const clickedInside = target.closest('[data-dropdown]');
  
  // Espera un ciclo de ejecución antes de cerrar para permitir el routerLink
  setTimeout(() => {
    if (!clickedInside) {
      this.showDropdown = false;
    }
  }, 0);
}

}

