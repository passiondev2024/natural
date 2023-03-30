export type AvailableColumn = {
    /**
     * This must be the column ID as defined in `matColumnDef`
     *
     * Implementation details:
     *
     * Unfortunately, we cannot use a `Record<AvailableColumn>` where keys would implicitly be unique and would replace
     * this ID property, because only ES2020 guarantee the order of object keys, and we must still support ES2015 for
     * iPhone 6. So, instead of `Record<AvailableColumn>`, we use `AvailableColumn[]` for now. But this could be
     * revisited once we drop support of ES2015.
     *
     * @see https://stackoverflow.com/questions/30076219/does-es6-introduce-a-well-defined-order-of-enumeration-for-object-properties
     */
    id: string;

    /**
     * Localized label of column for human
     */
    label: string;

    /**
     * Initial checked state, defaults to `true`.
     */
    checked?: boolean;

    /**
     * Initial visibility state, defaults to `false`.
     *
     * A column that is hidden will not appear in the list of choice,
     * but it will be included in the result of selected columns.
     */
    hidden?: boolean;
};
