import { Component, ElementRef, ViewChild } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'wiki-dark';
  theme?: string;
  themeText?: string;
  themes = ['light', 'dark', 'darker'];

  constructor(private dataService: DataService, private meta: Meta) {
    this.meta.addTag({
      name: 'description',
      content: 'Wiki Dark serves Wikipedia articles with a light-on-dark color scheme.'
    });
  }

  ngOnInit() {
    this.dataService.theme.subscribe((theme) => {
      if(this.theme) {
        document.body.classList.remove(this.theme);
      }
      document.body.classList.add(theme);
      this.theme = theme;
      const nextTheme = this.themes[(this.themes.indexOf(theme) + 1) % 3];
      this.themeText = nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1);
    });
  }

  toggleTheme() {
    this.dataService.setTheme(this.themes[(this.themes.indexOf(this.theme!) + 1) % 3]);
  }
}
