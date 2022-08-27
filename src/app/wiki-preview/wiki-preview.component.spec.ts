import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WikiPreviewComponent } from './wiki-preview.component';

describe('WikiPreviewComponent', () => {
  let component: WikiPreviewComponent;
  let fixture: ComponentFixture<WikiPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WikiPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WikiPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
