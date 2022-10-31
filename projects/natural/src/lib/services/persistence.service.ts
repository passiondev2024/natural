import {Inject, Injectable, InjectionToken, Optional} from '@angular/core';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {clone} from 'lodash-es';
import {NaturalStorage, SESSION_STORAGE} from '../modules/common/services/memory-storage';

/**
 * Validator for persisted values retrieved from NaturalPersistenceService. If returns false, the persisted value
 * will be ignored, and instead `null` will be returned.
 *
 * `storageKey` is only given if the value is coming from session storage (and not from URL).
 */
type PersistenceValidator = (key: string, storageKey: string | null, value: unknown) => boolean;

export const PERSISTENCE_VALIDATOR = new InjectionToken<PersistenceValidator>(
    'Validator for persisted value retrieved from NaturalPersistenceService. If returns false, the persisted value will never be returned.',
);

@Injectable({
    providedIn: 'root',
})
export class NaturalPersistenceService {
    public constructor(
        private readonly router: Router,
        @Inject(SESSION_STORAGE) private readonly sessionStorage: NaturalStorage,
        @Optional() @Inject(PERSISTENCE_VALIDATOR) private readonly isValid: PersistenceValidator,
    ) {
        // By default, anything is valid
        this.isValid = this.isValid ?? (() => true);
    }

    /**
     * Persist in url and local storage the given value with the given key.
     * When stored in storage, we need more "key" to identify the controller.
     */
    public persist(
        key: string,
        value: unknown,
        route: ActivatedRoute,
        storageKey: string,
        navigationExtras?: NavigationExtras,
    ): Promise<boolean> {
        this.persistInStorage(key, value, storageKey);
        return this.persistInUrl(key, value, route, navigationExtras);
    }

    /**
     * Return object with persisted data in url or in session storage
     * Url has priority over session storage because of url sharing. When url is provided, session storage is ignored.
     * Url and storage are synced when arriving in a component :
     *  - When loading with url parameters, storage is updated to stay synced
     *  - When loading without url, but with storage data, the url is updated
     */
    public get(key: string, route: ActivatedRoute, storageKey: string): any | null {
        // From url
        let params = this.getFromUrl(key, route);
        if (!this.isFalseyValue(params)) {
            this.persistInStorage(key, params, storageKey);
            return params;
        }

        // From storage
        params = this.getFromStorage(key, storageKey);
        if (!this.isFalseyValue(params)) {
            this.persistInUrl(key, params, route);
            return params;
        }

        return null;
    }

    /**
     * Get given key from the url parameters
     */
    public getFromUrl(key: string, route: ActivatedRoute): any | null {
        const value = route.snapshot.paramMap.get(key);

        return this.deserialize(key, null, value);
    }

    /**
     * Add/override given pair key-value in the url
     * Always JSON.stringify() the given value
     * If the value is falsey, the pair key-value is removed from the url.
     */
    public persistInUrl(
        key: string,
        value: unknown,
        route: ActivatedRoute,
        navigationExtras?: NavigationExtras,
    ): Promise<boolean> {
        const params = clone(route.snapshot.url[route.snapshot.url.length - 1].parameters);

        if (this.isFalseyValue(value)) {
            delete params[key];
        } else {
            params[key] = JSON.stringify(value);
        }

        navigationExtras = Object.assign(navigationExtras || {}, {relativeTo: route});

        return this.router.navigate(['.', params], navigationExtras);
    }

    public getFromStorage(key: string, storageKey: string): any | null {
        const value = this.sessionStorage.getItem(this.getStorageKey(key, storageKey));

        return this.deserialize(key, storageKey, value);
    }

    /**
     * Store value in session storage.
     * If value is falsy, the entry is removed
     */
    public persistInStorage(key: string, value: unknown, storageKey: string): void {
        if (this.isFalseyValue(value)) {
            this.sessionStorage.removeItem(this.getStorageKey(key, storageKey));
        } else {
            this.sessionStorage.setItem(this.getStorageKey(key, storageKey), JSON.stringify(value));
        }
    }

    private getStorageKey(key: string, storageKey: string): string {
        return storageKey + '-' + key;
    }

    // Returns if the given value is falsey
    // Falsey values are : null, undefined and empty string.
    // This cause usually the parameter to be removed from url/storage instead of being stored with no value. Url would be polluted.
    private isFalseyValue(value: unknown): boolean {
        return value == null || value === ''; // == means null or undefined;
    }

    private deserialize<T>(key: string, storageKey: string | null, value: string | null): unknown | null {
        if (!value) {
            return null;
        }

        let result = null;
        try {
            result = JSON.parse(value);
        } catch (e) {}

        return this.isValid(key, storageKey, result) ? result : null;
    }
}
