import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
  }

  onSubmit() {
    const query = this.searchForm.value.query.trim();
    if(!query) return;
    //TODO prompt validation
    this.router.navigate(['/search'], {queryParams: {q: query}});
  }
}
