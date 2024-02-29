import {expect, test} from '@playwright/test';
import {AppPage} from './app.po';

test.describe('Demo', () => {
    let app: AppPage;

    test.beforeEach(({page}) => {
        app = new AppPage(page);
    });

    test('should display welcome message', async ({page}) => {
        await page.goto('/');
        expect(await app.getTitleText()).toEqual('@ecodev/natural');
    });

    test('should distinct select search and selected value', async ({page}) => {
        await page.goto('/select');

        const inputSelector = '#test-select input';

        // Search anything and wait for autocomplete
        await page.fill(inputSelector, 'any search');
        await page.waitForSelector('.mat-mdc-autocomplete-panel');

        // select first value
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        expect(await page.inputValue(inputSelector)).toEqual('name-16');

        // Search something else, and expect to read the searched value
        await page.fill(inputSelector, 'any search 2');
        expect(await page.inputValue(inputSelector)).toEqual('any search 2');

        // Cancel search and expect to read original value (committed model)
        await page.keyboard.press('Escape');
        expect(await page.inputValue(inputSelector)).toEqual('name-16');

        // Search something else, and expect to read the searched value when bluring the field
        await page.fill(inputSelector, 'any search 3');
        await page.locator(inputSelector).blur();
        expect(await page.inputValue(inputSelector)).toEqual('name-16');

        // Unselect model by entering empty field with ENTER key
        await page.fill(inputSelector, '');
        await page.keyboard.press('Enter');
        expect(await page.inputValue(inputSelector)).toEqual('');
    });
});
