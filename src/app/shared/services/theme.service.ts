import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    public readonly theme = new BehaviorSubject<string>('defaultDark');
    private darkActivated = false;

    public constructor() {
        if (this.theme.value.includes('Dark')) {
            this.darkActivated = true;
        }
    }

    public set(theme: string): void {
        if (this.darkActivated && !theme.includes('Dark')) {
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
