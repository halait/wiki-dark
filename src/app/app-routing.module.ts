import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { SearchResolver } from './search/search.resolver';
import { WikiResolver } from './wiki.resolver';
import { WikiComponent } from './wiki/wiki.component';
const routes: Routes = [
  {path: '', redirectTo: '/wiki/Main_Page', pathMatch: 'full'},
  {
    path: 'wiki/:title',
    component: WikiComponent,
    resolve: {wiki: WikiResolver}
  },
  // TODO search resolver
  {
    path: 'search',
    component: SearchComponent,
    resolve: {
      results: SearchResolver
    }
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
