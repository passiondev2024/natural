import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Params, QueryParamsHandling, RouterLink} from '@angular/router';
import {ThemePalette} from '@angular/material/core';

type TableButtonConfiguration = {
    label?: string | null;
    icon?: string | null;
    href?: string | null;
    navigate: RouterLink['routerLink'];
    queryParams: Params;
    queryParamsHandling: QueryParamsHandling;
    fragment?: string | undefined;
    preserveFragment: boolean;
    raised: boolean;
    color: ThemePalette;
};

@Component({
    selector: 'app-other',
    templateUrl: './other.component.html',
    styleUrls: ['./other.component.scss'],
})
export class OtherComponent implements OnInit {
    /**
     * Single control
     */
    public httpPrefixControl = new FormControl('', [Validators.required]);
    public configurations: TableButtonConfiguration[] = [
        {
            label: 'my label without any link',
            icon: undefined,
            href: undefined,
            navigate: [],
            queryParams: {},
            queryParamsHandling: '',
            fragment: undefined,
            preserveFragment: false,
            raised: false,
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
            raised: false,
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
            raised: false,
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
            raised: false,
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
            raised: false,
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
            raised: false,
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
            raised: false,
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
            raised: false,
            color: undefined,
        },
    ];

    /**
     * Form group
     */
    public httpPrefixGroup = new FormGroup({
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
}
