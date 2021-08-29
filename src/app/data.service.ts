import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public theme = new BehaviorSubject<string>(localStorage.getItem('theme') || 'dark');
  private mobileModeQueryList = window.matchMedia('(max-width: 60rem)');
  public mobileMode = new BehaviorSubject<boolean>(this.mobileModeQueryList.matches);
  private wikiCache = new Map();

  constructor() {
    this.setTheme(this.theme.getValue());
    this.mobileModeQueryList.addEventListener('change', (query) => {
      // why does it fire twice on when going to small?
      if(this.mobileMode.getValue() != query.matches) {
        console.log('DataService: mobile mode changed to - ' + query.matches);
        this.mobileMode.next(query.matches);
      }
    });
  }

  setTheme(theme: string) {
    localStorage.setItem('theme', theme);
    this.theme.next(theme);
  }

  /*
  setMobileMode(mobileMode: boolean) {
    this.mobileMode.next(mobileMode);
  }
  */

  async getSearchResults(query: string): Promise<any[]> {
    /*
    try {
      const text = await this.getWiki(query);
      return text;
    } catch(e) {
      console.error('getWiki threw');
    }
    */
    const response = await fetch(
      `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${query}&limit=10`,
      {
        headers: {'Api-User-Agent': 'Wiki Dark bot/0.0 (info@sourcebase.ca)'}
      }
    );
    const data = await response.json();
    return data.pages as any[];
  }
  
  async getWiki(title: string): Promise<any> {
    console.log('getting wiki');
    /*
      `https://en.wikipedia.org/w/rest.php/v1/page/${title}/with_html`

      `https://en.wikipedia.org/w/api.php?origin=*&action=parse&page=${title}&prop=text&formatversion=2&format=json`
    */
    if(this.wikiCache.size > 200) {
      this.wikiCache.clear();
    }

    const mobileMode = this.mobileMode.getValue()
    const cached = this.wikiCache.get(this.getCacheKey(title, mobileMode));
    if(cached) {
      console.warn('cache hit');
      return cached;
    }

    let endPointPrefix = 'https://en.wikipedia.org/api/rest_v1/page/html/';
    if(mobileMode) {
      endPointPrefix = 'https://en.wikipedia.org/api/rest_v1/page/mobile-html/'
    }
    const response = await fetch(
      endPointPrefix + title,
      {
        headers: {'Api-User-Agent': 'Wiki Dark bot/0.0 (info@sourcebase.ca)'}
      }
    );

    if(!response.ok) {
      throw 'Unable to get wiki';
    }

    const text = await response.text()

    this.wikiCache.set(this.getCacheKey(title, mobileMode), text);

    return text;
  }

  getCacheKey(title: string, mobileMode?: boolean) {
    // for caching consisteny
    if(!mobileMode) {
      mobileMode = false;
    }
    return title + mobileMode;
  }
}
