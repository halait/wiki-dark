import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { DataService } from "./data.service";

@Injectable({ providedIn: 'root' })
export class WikiResolver implements Resolve<String> {
  constructor(private service: DataService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any>|Promise<any>|any {
    const title = route.paramMap.get('title');
    console.warn('resolver getting ' + title);
    if(!title) return false;
    return this.service.getWiki(title);
  }
}