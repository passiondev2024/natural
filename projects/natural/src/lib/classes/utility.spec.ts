import {
    formatIsoDate,
    formatIsoDateTime,
    lowerCaseFirstLetter,
    makePlural,
    relationsToIds,
    SortingOrder,
    upperCaseFirstLetter,
    validateColumns,
    validatePagination,
    validateSorting,
} from '@ecodev/natural';

describe('relationsToIds', () => {
    it('should transform relations to id and remove __typename, but never touch File or Date instances', () => {
        const file = new File(['foo'], 'foo');
        const date = new Date();
        const input = {
            prop1: 'val1',
            obj1: {
                id: 123,
                prop2: 'val2',
            },
            prop3: {
                prop4: 'val4',
            },
            prop5: {
                prop6: 'val6',
                __typename: 'some type',
            },
            array: [{id: 10}, {id: 20}, {foo: 'bar'}],
            file: file,
            date: date,
            objWithNullId: {
                id: null,
                prop2: 'val2',
            },
            emptyString: '',
            zero: 0,
            false: false,
            objWhichIsNull: null,
            objWhichIsUndefined: undefined,
        };

        const expected = {
            prop1: 'val1',
            obj1: 123,
            prop3: {
                prop4: 'val4',
            },
            prop5: {
                prop6: 'val6',
            },
            array: [10, 20, {foo: 'bar'}],
            file: file,
            date: date,
            objWithNullId: {
                id: null,
                prop2: 'val2',
            },
            emptyString: '',
            zero: 0,
            false: false,
            objWhichIsNull: null,
            objWhichIsUndefined: undefined,
        };

        const result = relationsToIds(input);
        expect(result).toEqual(expected);

        // The original object must not be touched
        expect(input.prop5.__typename).toBe('some type');
    });
});

describe('makePlural', () => {
    it('should make plural according to approximative english grammar', () => {
        const cases = {
            Account: 'Accounts',
            AccountingDocument: 'AccountingDocuments',
            Action: 'Actions',
            Aggregation: 'Aggregations',
            AggregationSet: 'AggregationSets',
            Answer: 'Answers',
            AntiqueName: 'AntiqueNames',
            Artist: 'Artists',
            AttributeDefinition: 'AttributeDefinitions',
            AttributeValue: 'AttributeValues',
            AuditNote: 'AuditNotes',
            AuditNoteContainerInterface: 'AuditNoteContainerInterfaces',
            AutomaticStateStampInterface: 'AutomaticStateStampInterfaces',
            BelongChecklistInterface: 'BelongChecklistInterfaces',
            BelongGroupInterface: 'BelongGroupInterfaces',
            BelongOrganizationInterface: 'BelongOrganizationInterfaces',
            BelongShopInterface: 'BelongShopInterfaces',
            Bookable: 'Bookables',
            BookableMetadata: 'BookableMetadatas',
            BookableTag: 'BookableTags',
            Booking: 'Bookings',
            Calendar: 'Calendars',
            Card: 'Cards',
            Cart: 'Carts',
            CartLine: 'CartLines',
            Change: 'Changes',
            Chapter: 'Chapters',
            Checklist: 'Checklists',
            ChecklistDocument: 'ChecklistDocuments',
            ChecklistGroup: 'ChecklistGroups',
            City: 'Cities',
            Cluster: 'Clusters',
            Collection: 'Collections',
            Comment: 'Comments',
            Communication: 'Communications',
            ComputableInterface: 'ComputableInterfaces',
            Configuration: 'Configurations',
            Constraint: 'Constraints',
            Control: 'Controls',
            Country: 'Countries',
            Course: 'Courses',
            Dating: 'Datings',
            Document: 'Documents',
            DocumentInterface: 'DocumentInterfaces',
            DocumentNote: 'DocumentNotes',
            DocumentType: 'DocumentTypes',
            Domain: 'Domains',
            Door: 'Doors',
            DynamicScale: 'DynamicScales',
            EconomicActivity: 'EconomicActivities',
            EmailRecipient: 'EmailRecipients',
            EmailRecipientInterface: 'EmailRecipientInterfaces',
            Equipment: 'Equipments',
            Event: 'Events',
            ExpenseClaim: 'ExpenseClaims',
            Export: 'Exports',
            FacilitatorDocument: 'FacilitatorDocuments',
            Faq: 'Faqs',
            FaqCategory: 'FaqCategories',
            File: 'Files',
            Folder: 'Folders',
            Group: 'Groups',
            GroupDocument: 'GroupDocuments',
            HasParentInterface: 'HasParentInterfaces',
            HasScaleAndThresholdsInterface: 'HasScaleAndThresholdsInterfaces',
            Holiday: 'Holidays',
            IdentityProvider: 'IdentityProviders',
            Image: 'Images',
            Indicator: 'Indicators',
            IndicatorDocument: 'IndicatorDocuments',
            Institution: 'Institutions',
            Invoicable: 'Invoicables',
            InvoicableLine: 'InvoicableLines',
            Legal: 'Legals',
            LegalReference: 'LegalReferences',
            Lesson: 'Lessons',
            LessonData: 'LessonDatas',
            License: 'Licenses',
            Log: 'Logs',
            Map: 'Maps',
            MapCalendar: 'MapCalendars',
            MapPlace: 'MapPlaces',
            Material: 'Materials',
            Message: 'Messages',
            News: 'Newses',
            NotifiableInterface: 'NotifiableInterfaces',
            Objective: 'Objectives',
            Order: 'Orders',
            OrderLine: 'OrderLines',
            Organization: 'Organizations',
            OrganizationChecklist: 'OrganizationChecklists',
            PaymentMethod: 'PaymentMethods',
            Period: 'Periods',
            Place: 'Places',
            PlaceType: 'PlaceTypes',
            Position: 'Positions',
            Preset: 'Presets',
            Process: 'Processes',
            Product: 'Products',
            ProductTag: 'ProductTags',
            Question: 'Questions',
            QuestionSuggestion: 'QuestionSuggestions',
            Region: 'Regions',
            Report: 'Reports',
            Risk: 'Risks',
            RiskClassification: 'RiskClassifications',
            RiskFrequency: 'RiskFrequencies',
            RiskLevel: 'RiskLevels',
            RiskMatrix: 'RiskMatrixes',
            RiskSeverity: 'RiskSeverities',
            Rite: 'Rites',
            RoleContextInterface: 'RoleContextInterfaces',
            Scale: 'Scales',
            ScaleLike: 'ScaleLikes',
            Section: 'Sections',
            Session: 'Sessions',
            Setting: 'Settings',
            Sheet: 'Sheets',
            SheetCalendar: 'SheetCalendars',
            SheetOutput: 'SheetOutputs',
            Shift: 'Shifts',
            ShiftTag: 'ShiftTags',
            Shop: 'Shops',
            Site: 'Sites',
            SiteChecklist: 'SiteChecklists',
            State: 'States',
            Statistic: 'Statistics',
            StockMovement: 'StockMovements',
            Subscription: 'Subscriptions',
            SubscriptionForm: 'SubscriptionForms',
            Suggestion: 'Suggestions',
            Tag: 'Tags',
            Task: 'Tasks',
            Taxonomy: 'Taxonomies',
            Theme: 'Themes',
            Thesaurus: 'Thesauruses',
            Threshold: 'Thresholds',
            Timelog: 'Timelogs',
            Transaction: 'Transactions',
            TransactionLine: 'TransactionLines',
            TransactionTag: 'TransactionTags',
            User: 'Users',
            UserCalendar: 'UserCalendars',
            UserGroup: 'UserGroups',
            UserOrganization: 'UserOrganizations',
            UserPlace: 'UserPlaces',
            UserSite: 'UserSites',
            UserTag: 'UserTags',
        };

        Object.entries(cases).forEach(([input, expected]) => {
            expect(makePlural(input)).toBe(expected);
        });
    });
});

describe('upperCaseFirstLetter', () => {
    it('should uppercase first letter', () => {
        const result = upperCaseFirstLetter('foo bAr');
        expect(result).toBe('Foo bAr');
    });
});

describe('lowerCaseFirstLetter', () => {
    it('should lowercase first letter', () => {
        const result = lowerCaseFirstLetter('FOO BaR');
        expect(result).toBe('fOO BaR');
    });
});

describe('formatIsoDate', () => {
    it('should format date without time', () => {
        expect(formatIsoDate(new Date('2021-09-23T17:57:16+09:00'))).toBe('2021-09-23');
        expect(formatIsoDate(new Date('2021-01-01'))).toBe('2021-01-01');
    });
});

describe('formatIsoDateTime', () => {
    it('should format date without time', () => {
        // Use pattern because tests may be executed in different time zones
        const localDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;

        expect(formatIsoDateTime(new Date('2021-09-23T17:57:16+09:00'))).toMatch(localDatePattern);
        expect(formatIsoDateTime(new Date())).toMatch(localDatePattern);
    });
});

describe('validatePagination', () => {
    it('should validate pagination', () => {
        expect(validatePagination(undefined)).toBeNull();
        expect(validatePagination(null)).toBeNull();
        expect(validatePagination(1)).toBeNull();
        expect(validatePagination('a')).toBeNull();
        expect(validatePagination([])).toBeNull();
        expect(validatePagination({})).toEqual({});
        expect(validatePagination({foo: 123})).toEqual({});

        expect(
            validatePagination({
                offset: null,
                pageIndex: null,
                pageSize: null,
            }),
        ).toEqual({
            offset: null,
            pageIndex: null,
            pageSize: null,
        });

        expect(
            validatePagination({
                offset: undefined,
                pageIndex: undefined,
                pageSize: undefined,
            }),
        ).toEqual({});

        expect(
            validatePagination({
                offset: 1,
                pageIndex: 2,
                pageSize: 3,
            }),
        ).toEqual({
            offset: 1,
            pageIndex: 2,
            pageSize: 3,
        });

        expect(
            validatePagination({
                offset: 1,
                pageIndex: 2,
                pageSize: 3,
                foo: 123,
            }),
        ).toEqual({
            offset: 1,
            pageIndex: 2,
            pageSize: 3,
        });

        expect(
            validatePagination({
                offset: 'a',
                pageIndex: 'b',
                pageSize: 'c',
                foo: 123,
            }),
        ).toEqual({});
    });
});

describe('validateSorting', () => {
    it('should validate pagination', () => {
        expect(validateSorting(undefined)).toBeNull();
        expect(validateSorting(null)).toBeNull();
        expect(validateSorting(1)).toBeNull();
        expect(validateSorting('a')).toBeNull();
        expect(validateSorting({})).toBeNull();
        expect(validateSorting([])).toEqual([]);
        expect(validateSorting([{foo: 123}, null])).toEqual([]);

        expect(
            validateSorting([
                {
                    field: 'myField',
                    order: null,
                    nullAsHighest: null,
                    emptyStringAsHighest: null,
                },
            ]),
        ).toEqual([
            {
                field: 'myField',
                order: null,
                nullAsHighest: null,
                emptyStringAsHighest: null,
            },
        ]);

        expect(
            validateSorting([
                {
                    field: 'myField',
                    order: undefined,
                    nullAsHighest: undefined,
                    emptyStringAsHighest: undefined,
                },
            ]),
        ).toEqual([
            {
                field: 'myField',
            },
        ]);

        expect(
            validateSorting([
                {
                    field: 'myField',
                    order: SortingOrder.ASC,
                    nullAsHighest: true,
                    emptyStringAsHighest: true,
                },
            ]),
        ).toEqual([
            {
                field: 'myField',
                order: SortingOrder.ASC,
                nullAsHighest: true,
                emptyStringAsHighest: true,
            },
        ]);

        expect(
            validateSorting([
                {
                    field: 'myField2',
                    order: SortingOrder.DESC,
                    nullAsHighest: false,
                    emptyStringAsHighest: false,
                },
            ]),
        ).toEqual([
            {
                field: 'myField2',
                order: SortingOrder.DESC,
                nullAsHighest: false,
                emptyStringAsHighest: false,
            },
        ]);

        expect(
            validateSorting([
                {
                    field: 'myField',
                    order: SortingOrder.ASC,
                    nullAsHighest: true,
                    emptyStringAsHighest: true,
                    foo: 123,
                },
                {foo: 123},
                null,
            ]),
        ).toEqual([
            {
                field: 'myField',
                order: SortingOrder.ASC,
                nullAsHighest: true,
                emptyStringAsHighest: true,
            },
        ]);

        expect(
            validateSorting([
                {
                    field: 'myField',
                    order: 'foo',
                    nullAsHighest: 'foo',
                    emptyStringAsHighest: 'foo',
                },
            ]),
        ).toEqual([
            {
                field: 'myField',
            },
        ]);
    });
});

describe('validateColumns', () => {
    it('should validate columns', () => {
        expect(validateColumns(undefined)).toBeNull();
        expect(validateColumns(null)).toBeNull();
        expect(validateColumns(1)).toBeNull();
        expect(validateColumns({})).toBeNull();
        expect(validateColumns([])).toBeNull();

        expect(validateColumns('a')).toEqual(['a']);
        expect(validateColumns('a,b')).toEqual(['a', 'b']);
        expect(validateColumns('a,b,,,,')).toEqual(['a', 'b']);
    });
});
