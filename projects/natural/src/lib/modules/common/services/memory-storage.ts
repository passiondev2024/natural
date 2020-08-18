import {Injectable, InjectionToken, Provider} from '@angular/core';

export const SESSION_STORAGE = new InjectionToken<NaturalStorage>(
    'Session storage that can be shimed when running on server or in tests',
);

/**
 * Normal `Storage` type, but without array access
 */
export type NaturalStorage = Pick<Storage, 'length' | 'clear' | 'getItem' | 'key' | 'removeItem' | 'setItem'>;

/**
 * Memory storage to keep store volatile things in memory
 *
 * Should be used to shim sessionStorage when running on server or in our tests
 */
@Injectable({
    providedIn: 'root',
})
export class NaturalMemoryStorage implements NaturalStorage {
    private readonly data = new Map<string, string>();

    public get length(): number {
        return this.data.size;
    }

    public clear(): void {
        this.data.clear();
    }

    public getItem(key: string): string | null {
        const value = this.data.get(key);
        return value === undefined ? null : value;
    }

    public key(index: number): string | null {
        let i = 0;
        for (const key of this.data.keys()) {
            if (i++ === index) {
                return key;
            }
        }

        return null;
    }

    public removeItem(key: string): void {
        this.data.delete(key);
    }

    public setItem(key: string, value: string): void {
        this.data.set(key, value);
    }
}

export function sessionStorageFactory(): NaturalStorage {
    return sessionStorage;
}

/**
 * Standard sessionStorage provider that is compatible with SSR
 */
export const sessionStorageProvider: Provider = {
    // Here we must use a factory that return directly the value, otherwise it will
    // crash when running on server because the value does not exist (but the factory will
    // never actually be called on server, so the server will not see the missing value)
    provide: SESSION_STORAGE,
    useFactory: sessionStorageFactory,
};

/**
 * Provide memory storage to be used only in tests or SSR
 */
export const memoryStorageProvider: Provider = {
    provide: SESSION_STORAGE,
    useClass: NaturalMemoryStorage,
};
