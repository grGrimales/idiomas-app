import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GoogleSheetService {
  private hojas: Record<string, string> = {
    lucia: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKXkZHJe7A-SVqY757zfXrbaqu6gREDsIMxJDOUOUhldjfFyEy1echgmUaBsJrOedKkJrxyvl56P2m/pub?output=csv',
    carlos_grediana: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSKXkZHJe7A-SVqY757zfXrbaqu6gREDsIMxJDOUOUhldjfFyEy1echgmUaBsJrOedKkJrxyvl56P2m/pub?gid=966171772&single=true&output=csv',
  };

  constructor(private http: HttpClient) {}

  getCsvData(nombreHoja: string): Observable<any[]> {
    const url = this.hojas[nombreHoja];
    if (!url) {
      throw new Error(`No se encontró una hoja con el nombre: ${nombreHoja}`);
    }

    return this.http.get(url, { responseType: 'text' }).pipe(
      map(text => {
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        return lines.slice(1).map(line => {
          const values = line.split(',');
          const obj: any = {};
          headers.forEach((header, i) => {
            obj[header.trim()] = values[i]?.trim();
          });
          return obj;
        });
      })
    );
  }
}
