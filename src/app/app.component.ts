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
  @ViewChild('SiteThemeToggle') siteThemeToggle?: ElementRef;

  constructor(private dataService: DataService, private meta: Meta) {
    this.meta.addTag({
      name: 'description',
      content: 'Wiki Dark serves Wikipedia articles with a light-on-dark color scheme.'
    });
  }

  ngAfterViewInit() {
    this.dataService.theme.subscribe((theme) => {
      this.theme = theme;
      const toggle = this.siteThemeToggle!.nativeElement;
      if(theme === 'light') {
        document.body.classList.add('light');
        toggle.innerText = 'Dark';
      } else {
        document.body.classList.remove('light');
        toggle.innerText = 'Light';
      }
    });
  }

  toggleTheme() {
    if(this.theme === 'dark') {
      this.dataService.setTheme('light');
    } else {
      this.dataService.setTheme('dark');
    }
  }
}
