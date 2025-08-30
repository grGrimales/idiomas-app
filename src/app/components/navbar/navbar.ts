import { Component, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { GoogleSheetService } from '../../services/GoogleSheetService';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  showDropdown = false;

  constructor(
    private router: Router,
    private sheetService: GoogleSheetService,
    private el: ElementRef,
    private authService: AuthService
  ) {}

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  hideDropdown(): void {
    this.showDropdown = false;
  }

  refreshData(context: string) {
    this.sheetService.refreshCsvData('lucia').subscribe({
      next: (data) => {
      },
      error: (error) => {
        console.error('Error al actualizar los datos de Lucía:', error);
      }
    });

    this.sheetService.refreshCsvData('carlos_grediana').subscribe({
      next: (data) => {
      },
      error: (error) => {
        console.error('Error al actualizar los datos de Carlos/Grediana:', error);
      }
    });
  }

  navigate(route: string) {
    this.router.navigateByUrl(route).then(() => {
      this.showDropdown = false;
    });
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  logout() {
    this.authService.logout();
  }
}