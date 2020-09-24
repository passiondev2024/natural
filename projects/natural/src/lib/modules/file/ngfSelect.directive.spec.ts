import {
  ViewChild, Component, NgModule
} from "@angular/core"
import {
  inject, ComponentFixture, TestBed, async
} from '@angular/core/testing'
//import { By } from '@angular/platform-browser'
import { ngfModule } from './ngf.module'
import { ngfSelect } from './ngfSelect.directive'

@Component({
  selector: 'container',
  template: '<input type="file" #ngf="ngfSelect" ngfSelect />'
})
export class ContainerComponent {
  @ViewChild("ngf", null) ngf:ngfSelect
}

@NgModule({
  imports: [ ngfModule ],
  declarations: [ ContainerComponent ]
}) export class AppModule {}

describe('ngfSelect', () => {
  let fixture: ComponentFixture<ContainerComponent>;
  let component
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppModule]
    });

    return TestBed.compileComponents()
    .then(()=>{
      fixture = TestBed.createComponent(ContainerComponent);
      fixture.detectChanges();
      component = fixture.componentInstance
    })
  }));

  it('inits', ()=>{
    expect(fixture).not.toBeNull()
    expect(component).not.toBeNull()
    expect(component.ngf.selectable).toBe( true )
  })
})