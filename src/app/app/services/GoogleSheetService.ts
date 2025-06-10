import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GoogleSheetService {
  private hojas: Record<string, string> = {
    lucia: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKXkZHJe7A-SVqY757zfXrbaqu6gREDsIMxJDOUOUhldjfFyEy1echgmUaBsJrOedKkJrxyvl56P2m/pub?gid=0&single=true&output=tsv',
    carlos_grediana: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKXkZHJe7A-SVqY757zfXrbaqu6gREDsIMxJDOUOUhldjfFyEy1echgmUaBsJrOedKkJrxyvl56P2m/pub?gid=966171772&single=true&output=tsv',
  };

  constructor(private http: HttpClient) {}

  // Renombramos el método para reflejar que ahora lee TSV
  getCsvData(nombreHoja: string): Observable<any[]> {
    const url = this.hojas[nombreHoja];
    if (!url) {
      throw new Error(`No se encontró una hoja con el nombre: ${nombreHoja}`);
    }

    const localKey = `sheetData_${nombreHoja}`;
    const localData = localStorage.getItem(localKey);

    if (localData) {
      const parsedData = JSON.parse(localData);
      return of(parsedData);
    }

    // Llamamos al método que ahora maneja TSV
    return this.fetchAndCacheTsvData(nombreHoja, url);
  }

  // Renombramos el método para reflejar que ahora refresca TSV
  refreshCsvData(nombreHoja: string): Observable<any[]> {
    const url = this.hojas[nombreHoja];
    if (!url) {
      throw new Error(`No se encontró una hoja con el nombre: ${nombreHoja}`);
    }

    const localKey = `sheetData_${nombreHoja}`;
    localStorage.removeItem(localKey);

    // Llamamos al método que ahora maneja TSV
    return this.fetchAndCacheTsvData(nombreHoja, url);
  }

  // Método privado para obtener y cachear datos TSV
  private fetchAndCacheTsvData(nombreHoja: string, url: string): Observable<any[]> {
    const localKey = `sheetData_${nombreHoja}`;

    return this.http.get(url, { responseType: 'text' }).pipe(
      map(text => {
        const lines = text.split('\n');
        // Cambiamos el delimitador de ',' a '\t' para los encabezados
        const headers = lines[0].split('\t');
        const data = lines.slice(1).map(line => {
          // Cambiamos el delimitador de ',' a '\t' para los valores
          const values = line.split('\t');
          const obj: any = {};
          headers.forEach((header, i) => {
            obj[header.trim()] = values[i]?.trim();
          });
          return obj;
        });
        return data;
      }),
      tap(data => {
        localStorage.setItem(localKey, JSON.stringify(data));
      })
    );
  }
}
