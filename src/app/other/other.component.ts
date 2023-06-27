import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Params, QueryParamsHandling, RouterLink, RouterOutlet} from '@angular/router';
import {ThemePalette, MatRippleModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {NaturalIconDirective} from '../../../projects/natural/src/lib/modules/icon/icon.directive';
import {MatIconModule} from '@angular/material/icon';
import {NaturalHttpPrefixDirective} from '../../../projects/natural/src/lib/directives/http-prefix.directive';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FlexModule} from '@ngbracket/ngx-layout/flex';
import {NaturalTableButtonComponent} from '../../../projects/natural/src/lib/modules/table-button/table-button.component';
import {NgFor, JsonPipe} from '@angular/common';

type TableButtonConfiguration = {
    label?: string | null;
    icon?: string | null;
    href?: string | null;
    navigate: RouterLink['routerLink'];
    queryParams: Params;
    queryParamsHandling: QueryParamsHandling;
    fragment?: string | undefined;
    preserveFragment: boolean;
    color: ThemePalette;
};

@Component({
    selector: 'app-other',
    templateUrl: './other.component.html',
    styleUrls: ['./other.component.scss'],
    standalone: true,
    imports: [
        NgFor,
        NaturalTableButtonComponent,
        FlexModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        NaturalHttpPrefixDirective,
        ReactiveFormsModule,
        MatIconModule,
        NaturalIconDirective,
        MatButtonModule,
        MatMenuModule,
        MatDatepickerModule,
        RouterLink,
        MatRippleModule,
        RouterOutlet,
        JsonPipe,
    ],
})
export class OtherComponent implements OnInit {
    /**
     * Single control
     */
    public readonly httpPrefixControl = new FormControl('', [Validators.required]);
    public readonly configurations: TableButtonConfiguration[] = [
        {
            label: 'my label without any link',
            icon: undefined,
            href: undefined,
            navigate: [],
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: undefined,
            icon: 'home',
            href: undefined,
            navigate: [],
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: 'my label without any link',
            icon: 'home',
            href: undefined,
            navigate: [],
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: 'my label with undefined navigate',
            icon: 'home',
            href: undefined,
            navigate: undefined,
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: 'my label with routerLink',
            icon: undefined,
            href: undefined,
            navigate: ['/search'],
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: 'my label with href',
            icon: undefined,
            href: '/search',
            navigate: [],
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: 'my label with queryParams but no routerLink',
            icon: undefined,
            href: undefined,
            navigate: [],
            queryParams: {foo: 'bar'},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: 'my label with queryParams and routerLink',
            icon: 'home',
            href: undefined,
            navigate: ['/search'],
            queryParams: {foo: 'bar'},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: 'with colors',
            icon: 'home',
            href: undefined,
            navigate: ['/search'],
            queryParams: {foo: 'bar'},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: 'primary',
        },
    ];

    public readonly configurationsWithClick: TableButtonConfiguration[] = [
        {
            label: 'my label with click',
            icon: undefined,
            href: undefined,
            navigate: [],
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: undefined,
            icon: 'home',
            href: undefined,
            navigate: [],
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: 'my label with click',
            icon: undefined,
            href: undefined,
            navigate: [],
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
        {
            label: undefined,
            icon: 'home',
            href: undefined,
            navigate: [],
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            color: undefined,
        },
    ];

    /**
     * Form group
     */
    public readonly httpPrefixGroup = new FormGroup({
        prefix: new FormControl('', [Validators.required]),
    });

    public constructor(private httpClient: HttpClient) {}

    public ngOnInit(): void {
        this.httpPrefixControl.valueChanges.subscribe(value => {
            console.log('httpPrefixControl.valueChanges', value);
        });
        this.httpPrefixGroup.valueChanges.subscribe(value => {
            console.log('httpPrefixGroup.valueChanges', value);
        });
    }

    public error(): void {
        throw Error("I'm a natural error");
    }

    public error2(): void {
        this.httpClient.get('https://doesnotexist.youpi').subscribe();
    }

    public error3(): void {
        fetch('https://doesnotexist.youpi').then();
    }

    public log($event: MouseEvent): void {
        console.log('clicked', $event);
    }
}
