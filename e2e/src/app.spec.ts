import {expect, test} from '@playwright/test';

import {AppPage} from './app.po';

test.describe('Demo', () => {
    let app: AppPage;

    test.beforeEach(async ({page}) => {
        app = new AppPage(page);
    });

    test('should display welcome message', async ({page}) => {
        await page.goto('/');
        expect(await app.getTitleText()).toEqual('@ecodev/natural');
    });
});
