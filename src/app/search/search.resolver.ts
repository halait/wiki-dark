import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { DataService } from "../data.service";

@Injectable({ providedIn: 'root' })
export class SearchResolver implements Resolve<String> {
  constructor(private service: DataService) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<any> {
    const query = route.queryParamMap.get('q')!;
    return this.service.getSearchResults(query);
  }
}