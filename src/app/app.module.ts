import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { SearchComponent } from './search/search.component';
import { AppRoutingModule } from './app-routing.module';
import { WikiComponent } from './wiki/wiki.component';
import { QuickSearchComponent } from './quick-search/quick-search.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { MainPageComponent } from './main-page/main-page.component';
import { WikiPreviewComponent } from './wiki-preview/wiki-preview.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    WikiComponent,
    QuickSearchComponent,
    SearchResultsComponent,
    MainPageComponent,
    WikiPreviewComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
