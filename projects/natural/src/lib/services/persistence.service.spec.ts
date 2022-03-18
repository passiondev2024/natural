import {TestBed} from '@angular/core/testing';
import {
    memorySessionStorageProvider,
    NaturalPersistenceService,
    NaturalStorage,
    SESSION_STORAGE,
} from '@ecodev/natural';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRoute} from '@angular/router';

function mockedActivatedRoute(entries: readonly (readonly [string, any])[]): ActivatedRoute {
    return {
        snapshot: {
            paramMap: new Map(entries),
        },
    } as any;
}

describe('NaturalPersistenceService', () => {
    let service: NaturalPersistenceService;
    let storage: NaturalStorage;
    const storageKey = 'my-storage-key';
    const key = 'my-key';

    function mockStorage(value: string): void {
        storage.setItem(storageKey + '-' + key, value);
    }

    describe('with corrupted persisted data', () => {
        beforeEach(async () => {
            await TestBed.configureTestingModule({
                declarations: [],
                imports: [RouterTestingModule],
                providers: [memorySessionStorageProvider],
            }).compileComponents();

            service = TestBed.inject(NaturalPersistenceService);
            storage = TestBed.inject(SESSION_STORAGE);
        });

        it('should create', () => {
            expect(service).toBeTruthy();
        });

        it('should getFromUrl even invalid JSON', () => {
            // No value
            expect(service.getFromUrl(key, mockedActivatedRoute([]))).toBeNull();

            // Empty
            expect(service.getFromUrl(key, mockedActivatedRoute([[key, '']]))).toBeNull();

            // Valid value
            expect(service.getFromUrl(key, mockedActivatedRoute([[key, '{"a":123}']]))).toEqual({a: 123});

            // Broken JSON return null
            expect(service.getFromUrl(key, mockedActivatedRoute([[key, '{"a,12']]))).toBeNull();
        });

        it('should getFromStorage even invalid JSON', () => {
            // No value
            expect(service.getFromStorage(key, storageKey)).toBeNull();

            // Empty
            mockStorage('');
            expect(service.getFromStorage(key, storageKey)).toBeNull();

            // Valid value
            mockStorage('{"a":123}');
            expect(service.getFromStorage(key, storageKey)).toEqual({a: 123});

            // Broken JSON return null
            mockStorage('{"a,12');
            expect(service.getFromStorage(key, storageKey)).toBeNull();
        });
    });
});
