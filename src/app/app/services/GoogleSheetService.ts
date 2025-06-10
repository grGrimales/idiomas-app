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

    return this.fetchAndCacheCsvData(nombreHoja, url);
  }

  refreshCsvData(nombreHoja: string): Observable<any[]> {
    const url = this.hojas[nombreHoja];
    if (!url) {
      throw new Error(`No se encontró una hoja con el nombre: ${nombreHoja}`);
    }

    const localKey = `sheetData_${nombreHoja}`;
    localStorage.removeItem(localKey);

    return this.fetchAndCacheCsvData(nombreHoja, url);
  }

  private fetchAndCacheCsvData(nombreHoja: string, url: string): Observable<any[]> {
    const localKey = `sheetData_${nombreHoja}`;

    return this.http.get(url, { responseType: 'text' }).pipe(
      map(text => {
        const lines = text.split('\n');
        const headers = lines[0].split('  ');
        const data = lines.slice(1).map(line => {
          const values = line.split(' ');
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
