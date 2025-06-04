import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common'; // 👈 necesario para *ngIf

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  showDropdown = false;

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
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

