import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NaturalPanelsService} from './panels.service';

@Component({
    selector: 'natural-panels',
    template: '',
    standalone: true,
})
export class NaturalPanelsComponent implements OnDestroy {
    // PanelsComponent is kind of a "ghost" component to respond to an url matcher in route config,
    // An UrlMatcher (matcher attribute) is required to catch urls with an undefined number of params in url after a given param /panels/
    public constructor(
        private readonly panelsService: NaturalPanelsService,
        route: ActivatedRoute,
    ) {
        this.panelsService.start(route);
    }

    public ngOnDestroy(): void {
        this.panelsService.stop();
    }
}
