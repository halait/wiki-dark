import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { DataService } from '../data.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {

  featured: any;
  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private titleService: Title) { }

  ngOnInit(): void {
    this.featured = this.route.snapshot.data.featured;
    this.titleService.setTitle('Wiki Dark');

    console.log(this.featured);
  }

  async resolver(): Promise<any> {
    return await this.dataService.getFeaturedContent();
  }

}
