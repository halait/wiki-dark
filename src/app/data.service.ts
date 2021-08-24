import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public theme = new BehaviorSubject<string>(localStorage.getItem('theme') || 'dark');
  private wikiCache = new Map();

  constructor() {
    this.setTheme(this.theme.getValue());
  }

  setTheme(theme: string) {
    console.log('setting theme: ' + theme);
    localStorage.setItem('theme', theme);
    this.theme.next(theme);
  }

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
  
  async getWiki(title: string, mobileMode?: boolean): Promise<any> {
    console.log('getting wiki');
    /*
    const response = await fetch(
      `https://en.wikipedia.org/w/rest.php/v1/page/${title}/with_html`,
      {
        headers: {'Api-User-Agent': 'Wiki Dark bot/0.0 (info@sourcebase.ca)'}
      }
    );
    return (await response.json()).html;
    */
    /*
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?origin=*&action=parse&page=${title}&prop=text&formatversion=2&format=json`,
      {
        headers: {'Api-User-Agent': 'Wiki Dark bot/0.0 (info@sourcebase.ca)'}
      }
    );
    return (await response.json()).parse.text;
    */

    if(this.wikiCache.size > 100) {
      this.wikiCache.clear();
    }

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
