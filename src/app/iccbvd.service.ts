import { Injectable } from '@angular/core';
import { Http, Response }          from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Iccbvd } from './iccbvd';
@Injectable()
export class IccbvdService {
  constructor(private http: Http) { }
  getIccBvd(): Observable<Iccbvd[]> {
    return this.http
               .get('./assets/iccbvd.json')
               .map((res:Response) => res.json());
  }
}
