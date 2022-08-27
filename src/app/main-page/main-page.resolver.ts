import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { DataService } from "../data.service";

@Injectable({ providedIn: 'root' })
export class MainPageResolver implements Resolve<any> {
  constructor(private service: DataService) {}

  async resolve(): Promise<any> {
    return this.service.getFeaturedContent();
  }
}