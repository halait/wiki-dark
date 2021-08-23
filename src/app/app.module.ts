import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { SearchComponent } from './search/search.component';
import { AppRoutingModule } from './app-routing.module';
import { WikiComponent } from './wiki/wiki.component';
import { QuickSearchComponent } from './quick-search/quick-search.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    WikiComponent,
    QuickSearchComponent
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
