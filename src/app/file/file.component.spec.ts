import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockApolloProvider} from '../../../projects/natural/src/lib/testing/mock-apollo.provider';
import {FileComponent} from './file.component';
import {naturalProviders} from '@ecodev/natural';

describe('Demo FileComponent', () => {
    let component: FileComponent;
    let fixture: ComponentFixture<FileComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [naturalProviders, MockApolloProvider],
        }).compileComponents();
        fixture = TestBed.createComponent(FileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
