import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
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

  @ViewChild('div') container!: ElementRef;

  resizeObserver = new ResizeObserver((entry) => {
    const e = entry[0];
    let newHeight = e.contentRect.height;
    if(e.borderBoxSize && e.borderBoxSize.length) {
      newHeight = e.borderBoxSize[0].blockSize;
    }
    this.resizeIFrame(newHeight);
  });



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private ngZone: NgZone,
    private titleService: Title) { }

  ngOnInit(): void {
    this.dataService.mobileMode.subscribe((mobileMode) => {
      this.mobileMode = mobileMode;
      this.setWiki();
    });
  }

  async ngAfterViewInit() {
    this.dataService.theme.subscribe((theme) => {
      this.setTheme(theme);
    });
  
    await this.wait();

    this.route.paramMap.subscribe((map) => {
      this.title = map.get('title');
      this.setWiki();
    });
  }

  async setWiki() {
    if(!this.title) return;

    let wiki;
    try {
      wiki = await this.dataService.getWiki(this.title);
    } catch {
      // TODO failed to fetch error
      console.error('Failed to fetch Wiki');
      return;
    }

    this.container.nativeElement.style.minHeight = wiki.iframeHeight + 'px';

    if(this.iFrame) {
      const wiki = {
        html: this.iFrame.contentDocument!.documentElement.innerHTML,
        isProcessed: true,
        iframeHeight: this.iFrameHeight,
        scrollPosition: window.scrollY
      }
      this.dataService.cacheWiki(this.iFrame.dataset.title!, this.iFrame.dataset.isMobileVersion! === 'true', wiki);
      this.resizeObserver.disconnect();
      this.iFrameHeight = 0;
      this.iFrame.remove();
    }
    this.iFrame = document.createElement('iframe');

    this.iFrame.style.opacity = '0';

    this.iFrame.setAttribute('width', '100%');
    this.iFrame.dataset.title = this.title;
    this.iFrame.dataset.isMobileVersion = this.mobileMode!.toString();
    this.iFrame.id = 'WikiIFrame';
    this.container.nativeElement.appendChild(this.iFrame);
    const doc = this.iFrame.contentDocument as Document;

    
    try {
      await this.writeWiki(doc, wiki.html);
    } catch(e) {
      // TODO display error
      console.error(e);
      return;
    }
    //this.resizeIFrame(0);

    try {
      const decodedURL = decodeURIComponent(this.title);
      const title = (decodedURL as any).replaceAll('_', ' ') as string;
      this.wikiTitle = title.charAt(0).toUpperCase() + title.slice(1);
      this.titleService.setTitle(this.wikiTitle + ' - Wiki Dark');
    } catch(e) {
      this.wikiTitle = '';
      this.titleService.setTitle('WikiDark');
      console.error('Unable to decode URL');
    }

    if(!wiki.isProcessed) await this.proccessIframe();

    this.changeToInternalLinks();

    const headings = doc.querySelectorAll('.wd-control-heading');
    for(let i = 0, len = headings.length; i != len; ++i) {
      const heading = headings[i];
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

    this.setTheme(this.theme);

    console.log('break');

    this.iFrame.style.opacity = '1';

    this.resizeIFrame(wiki.iframeHeight);
    this.resizeObserver.observe(doc.body);

    this.container.nativeElement.style.minHeight = 0 + 'px';

    // TODO fix mobile scrolling
    if(this.mobileMode) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo(0, wiki.scrollPosition);
    }
  }

  
  wait() {
    return new Promise(function(resolve) {
      setTimeout(() => {resolve(null)}, 0);
    });
  }
  
  style!: string;

  async proccessIframe() {
    const doc = this.iFrame!.contentDocument!;
    const css = doc.createElement('style');

    //css.href = this.origin + '/assets/wiki-styles.css';
    //css.rel = 'stylesheet';
    //css.type = 'text/css';


    if(!this.style) {
      const res = await fetch('/assets/wiki-styles.css');
      this.style = await res.text();
    }
    css.innerHTML = this.style;

    doc.head.appendChild(css);



    /*
    const script = doc.createElement('script');
    script.src = this.origin + '/assets/wiki-script.js';
    doc.head.appendChild(script);
    */

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
      section.innerHTML = '';
      div.id = 'wd-' + toc[i].id;
      div.style.display = 'none';
      section.appendChild(heading);
      section.appendChild(div);
      heading.classList.add('wd-control-heading');
      heading.classList.add('wd-control-heading-hidden');
      heading.dataset.divId = div.id;
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
        e.preventDefault();
        const elem = e.currentTarget as HTMLAnchorElement;
        if(elem.origin === this.origin) {
          this.ngZone.run(() => {this.router.navigate([elem.pathname]);});
        } else {
          window.location.href = a.href;
        }
      });
    }
  }

  setTheme(theme?: string) {
    this.theme = theme;
    if(!this.iFrame) {
      return;
    }
    const doc = this.iFrame.contentDocument!;

    doc.body.classList.add('light');
    this.iFrame!.classList.add('light');

    if(this.mobileMode && this.iFrame.contentWindow && (this.iFrame.contentWindow as any).pcs && this.title != 'Main_Page') {
      const win = this.iFrame.contentWindow as any;
      if(theme === 'dark') {
        win.pcs.c1.Page.setTheme('pcs-theme-black');
      } else {
        win.pcs.c1.Page.setTheme('pcs-theme-light');
      }
    } else {
      if(theme === 'dark') {
        doc.body.classList.remove('light');
        this.iFrame!.classList.remove('light');
      }
    }
  }

  writeWiki(doc: Document, html: string) {
    doc.open();

    return new Promise((resolve) => {
      /*
      doc.addEventListener('readystatechange', () => {
        console.log(doc.readyState + ' time: ' + Date.now());
        if(doc.readyState === 'complete') {
          resolve(doc.readyState);
        }
      });
      */

      doc.write(html);

      this.iFrame!.addEventListener('load', () => {
        //console.log(doc.readyState + ' time: ' + Date.now());
        if(doc.readyState === 'complete') {
          resolve(doc.readyState);
        }
      });

      doc.close();
      setTimeout(() => {resolve(doc.readyState)}, 5000);
    });
  }

  resizeIFrame(newHeight: number) {
    console.log('resizing ');
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