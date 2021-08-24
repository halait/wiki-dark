import { Component, NgZone, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { DataService } from '../data.service';

@Component({
  selector: 'app-wiki',
  templateUrl: './wiki.component.html',
  styleUrls: ['./wiki.component.css']
})
export class WikiComponent implements OnInit {
  iFrame?: HTMLIFrameElement | null;
  title?: string | null;
  wikiTitle?: string;
  theme?: string;
  mobileMode = true;
  iFrameHeight = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private ngZone: NgZone,
    private titleService: Title) { }

  ngOnInit(): void {
    const mediaQueryList = window.matchMedia('(max-width: 60rem)');
    this.mobileMode = mediaQueryList.matches;
    console.log('mobile mode: ' + this.mobileMode);
    mediaQueryList.addEventListener('change', (query) => {
      this.mobileMode = query.matches;
      console.log('mobile mode changed: ' + this.mobileMode);
      this.setWiki();
    });
  }

  async ngAfterViewInit() {
    console.log('ngAfterViewInit');

    this.iFrame = document.getElementById('WikiIFrame') as HTMLIFrameElement;
    if(!this.iFrame) {
      throw "Can't access iFrame";
    }

    const doc = this.iFrame.contentDocument;
    if(!doc) {
      throw 'Unable to access iFrame doc';
    }

    /*
    setInterval(() => {
      console.log('try resize');
      this.resizeIFrame();
    }, 4000);
    */

    this.dataService.theme.subscribe((theme) => {
      console.log('got theme at wiki componenet');
      this.setTheme(theme);
    });

    this.route.paramMap.subscribe((map) => {
      this.title = map.get('title');
      this.setWiki();
    });
  }

  async setWiki() {
    const doc = this.iFrame!.contentDocument as Document;
    if(!doc) throw 'No doc';
    if(!this.title) throw 'No title';
    console.log('setting wiki');
    window.scrollTo(0, 0);
    let page;
    try {
      page = await this.dataService.getWiki(this.title, this.mobileMode);
    } catch {
      this.wikiTitle = 'Error: Unable to fetch page.';
      return;
    }
    
    await this.writeWiki(doc, page);

    try {
      const decodedURL = decodeURIComponent(this.title);
      this.wikiTitle = (decodedURL as any).replaceAll('_', ' ') as string;
      this.titleService.setTitle(this.wikiTitle + ' - Wiki Dark');
    } catch(e) {
      this.wikiTitle = '';
      this.titleService.setTitle('WikiDark');
      console.error('Unable to decode URL');
    }

    

    try {
      this.changeToInternalLinks();
    } catch(e) {
      console.error(e);
    }

    const css = doc.createElement('link');
    css.href = this.getBaseUrl() + '/assets/wiki-styles.css';
    css.rel = 'stylesheet';
    css.type = 'text/css';
    doc.head.appendChild(css);

    // dynamic resizing
    // doing it this way cause Chrome does not fire load event when using innerHTML method
    let script = doc.createElement('script');
    script.src = this.getBaseUrl() + '/assets/wiki-script.js';
    doc.head.appendChild(script);

    console.log(this.theme + ' theme setting wiki');
    this.setTheme(this.theme);

    /*
    script = doc.createElement('script');
    script.src = 'https://en.wikipedia.org/api/rest_v1/data/javascript/mobile/pagelib';
    doc.head.appendChild(script);
    */

    const resizeObserver = new ResizeObserver((entry) => {
      const e = entry[0];
      let newHeight = e.contentRect.height;
      if(e.borderBoxSize) {
        newHeight = e.borderBoxSize[0].blockSize;
      }
      this.resizeIFrame(newHeight);
    });
    resizeObserver.observe(doc.body);

    //this.resizeIFrame();

    /*
    this.iFrame!.contentWindow!.addEventListener('resize', () => {
      console.warn('resize iFrame event');
      this.resizeIFrame();
    });
    */
  }

  getBaseUrl() {
    return window.location.origin;
  }

  // memory leak?
  changeToInternalLinks() {
    if(!this.iFrame || !this.iFrame.contentDocument) {
      throw 'No iFrame';
    }
    const base = this.iFrame.contentDocument.querySelector('base');
    if(!base) {
      throw 'No base tag';
    }
    const baseOrigin = new URL(base.href).origin;
    const anchors = this.iFrame.contentDocument.querySelectorAll('a');
    for(let i = 0, len = anchors.length; i != len; ++i) {
      const a = anchors[i];
      let internal = false;
      if(baseOrigin === a.origin && a.pathname.substr(1, 4) === 'wiki') {
        // check if file resource, don't redirect
        // TODO change to overlay
        if(a.pathname.substr(1, 10) !== 'wiki/File:') {
          internal = true;
          a.href = this.getBaseUrl() + a.pathname;
        }
      }
      a.addEventListener('click', (e) => {
        e.preventDefault();
        if(internal) {
          this.ngZone.run(() => {this.router.navigate([a.pathname]);});
        } else {
          window.location.href = a.href;
        }
      });
    }
  }

  setTheme(theme?: string) {
    this.theme = theme;
    const doc = this.iFrame!.contentDocument;
    if(!doc || !doc.body) {
      console.error('no doc or doc.body in frame');
      return;
    } 
    if(theme === 'dark') {
      doc.body.classList.remove('light');
    } else {
      doc.body.classList.add('light');
    }
    
    /*
    if(theme == 'dark') {
      const css = doc.createElement('link');
      css.href = this.getBaseUrl() + '/assets/wiki-styles.css';
      css.rel = 'stylesheet';
      css.type = 'text/css';
      doc.head.appendChild(css);
    } else {
      const css = doc.querySelector(`link[href="${this.getBaseUrl() + '/assets/wiki-styles.css'}"]`);
      console.log(css);
      if(!css) return; 
      doc.head.removeChild(css);
    }
    */
  }

  writeWiki(doc: Document, html: string) {
    doc.open();
    doc.write(html);
    doc.close();

    return new Promise((resolve, reject) => {
      if(this.isReadyState(doc.readyState)) {
        resolve(doc.readyState);
      }
      doc.addEventListener('readystatechange', () => {
        if(this.isReadyState(doc.readyState)) {
          resolve(doc.readyState);
          console.warn(doc.readyState);
        }
      });
      setTimeout(() => {reject("Took too long")}, 5000);
    });
  }

  isReadyState(state: String) {
    if(state === 'complete') {
      return true;
    }
    return false;
  }

  resizeIFrame(newHeight: number) {
    /*
    const doc = this.iFrame!.contentDocument;
    if(!doc || !doc.body) {
      console.warn('No doc or body');
      return;
    }
    const newHeight = doc.body.getBoundingClientRect().height;
    if(Math.abs(newHeight - this.iFrameHeight) < 16) return;
    console.log('resizing iframe');
    this.iFrameHeight = newHeight;
    // TODO why do I need padding?
    this.iFrame!.height = (newHeight + 64).toString();
    */
    console.log('newHeight: ' + newHeight);
    if(Math.abs(newHeight - this.iFrameHeight) < 32) return;
    this.iFrame!.height = (newHeight + 128).toString();
    this.iFrameHeight = newHeight;
  }
}