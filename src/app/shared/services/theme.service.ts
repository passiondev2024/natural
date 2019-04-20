import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {

    private darkActivated: boolean;

    public readonly theme: BehaviorSubject<string> = new BehaviorSubject('defaultDark');

    constructor() {
        if (this.theme.value.indexOf('Dark') > -1) {
            this.darkActivated = true;
        }
    }

    public set(theme: string): void {
        if (this.darkActivated && theme.indexOf('Dark') === -1) {
            this.theme.next('defaultDark');
        } else {
            this.theme.next('default');
        }
    }

    public setNightMode(val: boolean): void {
        this.darkActivated = val;
        this.set(this.theme.getValue());
    }

    public toggle(): void {
        this.setNightMode(!this.darkActivated);
    }

}
