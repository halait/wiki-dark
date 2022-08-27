import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../data.service';

@Component({
  selector: 'app-quick-search',
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.css']
})
export class QuickSearchComponent implements OnInit {
  searchForm = this.formBuilder.group({
    query: ['', Validators.required]
  });
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService) { }

  ngOnInit(): void {
  }

  async onSubmit() {
    document.getElementById('SearchInput')!.blur();
    const query = this.searchForm.value.query.trim();
    //TODO prompt validation
    if(!query) return;
    try {
      await this.dataService.getWiki(query, false);
      this.router.navigate(['/wiki/' + query]);
    } catch(e) {
      console.log('No wiki page for search, redirecting to regular search');
      this.router.navigate(['/search'], {queryParams: {q: query}});
    }
  }
}
