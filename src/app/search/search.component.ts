import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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
    this.route.queryParamMap.subscribe((map) => {
      this.search(map.get('q'));
    });
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
}
