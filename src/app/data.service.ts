import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Wiki } from './wiki';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public theme = new BehaviorSubject<string>(localStorage.getItem('theme') || 'dark');
  private mobileModeQueryList = window.matchMedia('(max-width: 60rem)');
  public mobileMode = new BehaviorSubject<boolean>(this.mobileModeQueryList.matches);
  private wikiCache = new Map();

  constructor() {
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

  async getSearchResults(query: string): Promise<any[]> {
    const response = await this.fetchWikiEndpoint(
      `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${query}&limit=10`
    );
    const data = await response.json();
    return data.pages as any[];
  }
  
  async getWiki(title: string, mobileVersion: boolean = this.mobileMode.getValue()): Promise<Wiki> {
    if(this.wikiCache.size > 200) {
      this.wikiCache.clear();
    }

    const cached = this.wikiCache.get(this.getCacheKey(title, mobileVersion));
    if(cached) {
      return cached;
    }

    let endPointPrefix = 'https://en.wikipedia.org/api/rest_v1/page/html/';
    if(mobileVersion) {
      endPointPrefix = 'https://en.wikipedia.org/api/rest_v1/page/mobile-html/'
    }
    const response = await this.fetchWikiEndpoint(endPointPrefix + title);

    if(!response.ok) {
      throw 'Unable to get wiki';
    }

    const text = await response.text();

    const wiki = {
      html: text,
      isProcessed: false,
      iframeHeight: 0,
      scrollPosition: 0
    };

    this.wikiCache.set(this.getCacheKey(title, mobileVersion), wiki);

    return wiki;
  }

  async getFeaturedContent(): Promise<any> {
    const date = new Date().toISOString();
    const endpoint = `https://en.wikipedia.org/api/rest_v1/feed/featured/${
      // ts compmians  replaceAll in es2021 or later
      (date.substring(0, date.indexOf('T')) as any).replaceAll('-', '/')
    }`;
    return await (await this.fetchWikiEndpoint(
      endpoint
    )).json();
  }

  async fetchWikiEndpoint(endpoint: string) {
    return await fetch(
      endpoint,
      {
        headers: {'Api-User-Agent': 'Wiki Dark bot/0.0 (info@sourcebase.ca)'}
      }
    );
  }

  cacheWiki(title: string, isMobileVersion: boolean, wiki: Wiki) {
    this.wikiCache.set(this.getCacheKey(title, isMobileVersion), wiki);
  }

  getCacheKey(title: string, mobileMode?: boolean) {
    // for caching consisteny
    if(!mobileMode) {
      mobileMode = false;
    }
    return title + mobileMode;
  }
}
