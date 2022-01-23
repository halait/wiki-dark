import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { DataService } from '../data.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  host: {'class': 'page-width'}
})
export class SearchComponent implements OnInit {
  /*
  searchForm = this.formBuilder.group({
    query: ['', Validators.required]
  });
  */
  results: any[] = [];
  message?: string;
  constructor(
    //private formBuilder: FormBuilder,
    private dataService : DataService,
    private route: ActivatedRoute,
    /*private router: Router*/) { }

  ngOnInit(): void {
    this.results = this.route.snapshot.data.results;
    /*
    this.route.queryParamMap.subscribe((map) => {
      //this.search(map.get('q'));
    });
    */
  }
  
  async search(query: string | null) {
    console.log('searching' + query);
    if(!query) {
      return;
    }
    this.results = await this.dataService.getSearchResults(query);
    if(!this.results.length) {
      this.message = 'Your search - ' + query + ' - did not match... anything...';
    }
  }

  /*
  async resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<any> {
    const query = route.queryParamMap.get('q');
    if(!query) {
      return;
    }
    this.results = await this.dataService.getSearchResults(query);
  }
  */
}
