import {Page} from '@playwright/test';

export class AppPage {
    constructor(private readonly page: Page) {}

    public getTitleText(): Promise<string> {
        return this.page.innerText('app-root h1');
    }
}
