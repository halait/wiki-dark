import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';
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
  {path: 'search?:query', component: SearchComponent},
  {path: 'search', component: SearchComponent}
];



@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
