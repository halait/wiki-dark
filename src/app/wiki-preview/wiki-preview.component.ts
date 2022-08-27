import { Component, OnInit, Input } from '@angular/core';
import { WikiPreview } from '../wiki-preview';


@Component({
  selector: 'app-wiki-preview',
  templateUrl: './wiki-preview.component.html',
  styleUrls: ['./wiki-preview.component.css']
})
export class WikiPreviewComponent implements OnInit {
  @Input() preview?: WikiPreview;
  constructor() { }

  ngOnInit(): void {
    
  }

}
