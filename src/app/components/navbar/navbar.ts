import { Component, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para *ngIf
import { Router, RouterLink } from '@angular/router'; // Añadido RouterLink para el a routerLink="/" en el nav
import { GoogleSheetService } from '../../app/services/GoogleSheetService'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-navbar',
  standalone: true,
  // Importa CommonModule y RouterLink.
  // RouterLink es necesario porque estás usando routerLink directamente en un <a>
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html', // Asegúrate de que el nombre del archivo HTML sea correcto
  styleUrls: ['./navbar.css'], // Asegúrate de que el nombre del archivo CSS sea correcto
})
export class Navbar {
  showDropdown = false;

  // Inyecta Router, GoogleSheetService y ElementRef
  constructor(private router: Router, private sheetService: GoogleSheetService, private el: ElementRef) {}

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    // console.log('toggleDropdown llamado. showDropdown:', this.showDropdown); // Para depuración
  }

  // Ahora 'hideDropdown' es llamado solo por el evento (blur) del botón.
  // Es importante que no se llame desde los routerLink directamente si quieres usar navigate().
  hideDropdown(): void {
    this.showDropdown = false;
    // console.log('hideDropdown llamado (por blur). showDropdown:', this.showDropdown); // Para depuración
  }

  refreshData(context: string) {
    // Llama al método de refresco de datos para las hojas especificadas
    // Asegúrate de que tu GoogleSheetService tenga implementado refreshCsvData
    this.sheetService.refreshCsvData('lucia').subscribe({
      next: (data) => {
        console.log('Datos de Lucía actualizados:', data);
        // Aquí podrías hacer algo con los datos actualizados, como notificar a otros componentes
      },
      error: (error) => {
        console.error('Error al actualizar los datos de Lucía:', error);
      }
    });

    this.sheetService.refreshCsvData('carlos_grediana').subscribe({
      next: (data) => {
        console.log('Datos de Carlos/Grediana actualizados:', data);
        // Aquí podrías hacer algo con los datos actualizados
      },
      error: (error) => {
        console.error('Error al actualizar los datos de Carlos/Grediana:', error);
      }
    });
  }

  // Este método maneja la navegación y cierra el dropdown
  navigate(route: string) {
    this.router.navigateByUrl(route).then(() => {
      this.showDropdown = false; // Cierra el dropdown DESPUÉS de que la navegación se haya iniciado
      // console.log('navigate llamado a:', route, '. showDropdown:', this.showDropdown); // Para depuración
    });
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    // Si el clic NO fue dentro del elemento raíz de este componente (navbar)
    // Esto asegura que al hacer clic fuera del Navbar, el dropdown se cierre.
    if (!this.el.nativeElement.contains(event.target)) {
      this.showDropdown = false;
      // console.log('Clic fuera del Navbar. showDropdown:', this.showDropdown); // Para depuración
    }
  }
}