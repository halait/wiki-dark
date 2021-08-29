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
  mobileMode?: boolean;
  iFrameHeight = 0;
  origin =  window.location.origin;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private ngZone: NgZone,
    private titleService: Title) { }

  ngOnInit(): void {
    this.dataService.mobileMode.subscribe((mobileMode) => {
      console.log('mobile mode changed: ' + mobileMode);
      this.mobileMode = mobileMode;
      if(this.iFrame) {
        this.setWiki();
      }
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

    // TODO destroy and create iFrame everytime, javascript files stay loaded, memory leak (pcs from mobile version persists + other stuff probably)



    const doc = this.iFrame!.contentDocument as Document;
    if(!doc) throw 'No doc';
    if(!this.title) throw 'No title';
    console.log('setting wiki');
    window.scrollTo(0, 0);
    let page;
    try {
      page = await this.dataService.getWiki(this.title);
    } catch {
      this.wikiTitle = 'Error: Unable to fetch page.';
      return;
    }


    // TODO display error if needed
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

    const css = doc.createElement('link');
    css.href = this.origin + '/assets/wiki-styles.css';
    css.rel = 'stylesheet';
    css.type = 'text/css';
    doc.head.appendChild(css);

    /*
    // dynamic resizing
    // doing it this way cause Chrome does not fire load event when using innerHTML method
    let script = doc.createElement('script');
    script.src = this.origin + '/assets/wiki-script.js';
    doc.head.appendChild(script);
    */

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
      if(e.borderBoxSize && e.borderBoxSize.length) {
        newHeight = e.borderBoxSize[0].blockSize;
      }
      this.resizeIFrame(newHeight);
    });
    resizeObserver.observe(doc.body);
    


    //setTimeout(() => {
      const toc = this.getTableOfContents(doc);
      for(let i = 0, len = toc.length; i != len; ++i) {
        if(toc[i].level != 1) continue;
        const section = doc.querySelector(`section[data-mw-section-id="${toc[i].id}"]`) as HTMLElement;
        if(!section) continue;
        const heading = doc.getElementById(toc[i].anchor) as HTMLHeadingElement;
        if(!heading) continue;
        if(heading.parentElement != section) {
          if(
            !heading.parentElement ||
            heading.parentElement.parentElement != section ||
            heading.parentElement.getAttribute('onclick')) {
              continue;
          }
          heading.parentElement.remove();
        } else {
          heading.remove();
        }
        const div = doc.createElement('div');


        while(section.hasChildNodes()) {
          div.appendChild(section.firstChild!);
        }
        //div.innerHTML = section.innerHTML;
        section.innerHTML = '';
        div.id = 'wd-' + toc[i].id;
        div.style.display = 'none';
        section.appendChild(heading);
        section.appendChild(div);
        heading.classList.add('wd-control-heading');
        heading.classList.add('wd-control-heading-hidden');
        heading.dataset.divId = div.id;
        heading.addEventListener('click', function(e) {
          const heading = e.currentTarget as HTMLHeadingElement;
          const hide = heading.classList.toggle('wd-control-heading-hidden');
          const div = heading.parentElement!.querySelector('#' + heading.dataset.divId!) as HTMLElement;
          if(hide) {
            div.style.display = 'none';
          } else {
            div.style.display = 'block';
          }
        });
      }
    //}, 1000);



    try {
      this.changeToInternalLinks();
    } catch(e) {
      console.error(e);
    }

  }

  // from pcs
  getTableOfContents(doc: any) {
    let e: any = doc.querySelectorAll("section") as any;
    let t: any = [];
    let  n = new Array(10).fill(0);
    let r = 0;
    return [].forEach.call(e, (function(e) {
        var a = parseInt((e as any).getAttribute("data-mw-section-id"), 10);
        if (!(!a || isNaN(a) || a < 1)) {
            var i = (e as any).querySelector("h1,h2,h3,h4,h5,h6");
            if (i) {
                var o = parseInt(i.tagName.charAt(1), 10) - 1;
                o < r && n.fill(0, o),
                r = o,
                n[o - 1]++,
                t.push({
                    level: o,
                    id: a,
                    number: n.slice(0, o).map((function(e) {
                        return e.toString()
                    }
                    )).join("."),
                    anchor: i.getAttribute("id"),
                    title: i.innerHTML.trim()
                })
            }
        }
    }
    )),
    t
  }



  // TODO memory leak?
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
      if(baseOrigin === a.origin && a.pathname.substr(1, 4) === 'wiki') {
        // check if file resource, don't redirect
        // TODO change to overlay
        if(a.pathname.substr(1, 10) !== 'wiki/File:') {
          // router seems to follow stricter urls (rfc 3986), problem if open in new tab etc.
          let pathname = a.pathname;
          try {
            pathname = this.encodeURI(pathname);
          } catch(e) {
            console.error(e);
          }
          a.href = this.origin + pathname;
        }
      }
      a.addEventListener('click', (e) => {
        this.navigateToLink(e);
      });
    }
  }

  navigateToLink(e: MouseEvent) {
    e.preventDefault();
    const elem = e.currentTarget as HTMLAnchorElement;
    if(elem.origin === this.origin) {
      this.ngZone.run(() => {this.router.navigate([elem.pathname]);});
    } else {
      window.location.href = elem.href;
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

    return new Promise((resolve, reject) => {
      doc.addEventListener('readystatechange', () => {
        console.warn('doc.readyState: ' + doc.readyState);
        if(doc.readyState != 'loading') {
          resolve(doc.readyState);
        }
      });

      doc.write(html);
      doc.close();

      setTimeout(() => {reject("Took too long")}, 3000);
    });
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

  encodeURI(str: string) {
    return str.replace(/[!'()*]/g, function(c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
  }
}