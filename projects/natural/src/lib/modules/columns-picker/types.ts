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

/**
 * A button that will be shown as an icon on desktop, or as a menu entry on mobile
 */
export type Button = {
    /**
     * On desktop will be shown as tooltip, or as menu entry on mobile
     */
    label: string;

    /**
     * The icon name to be used on desktop
     */
    icon: string;

    /**
     * Whether to show the button at all. Defaults to `true`.
     */
    show?: boolean;

    /**
     * Whether the button is disabled. Defaults to `false`.
     */
    disabled?: boolean;

    /**
     * A checked button will have a highlight color as an icon, or a check mark as menu entry. Defaults to `false`.
     */
    checked?: boolean;

    /**
     * The callback to call when button was clicked.
     */
    click?: (button: Button, event: Event) => void;

    /**
     * Rarely used, only for OKpilot where we want to show proper URL, but click is actually intercepted to show dialog
     */
    href?: string;

    /**
     * A non-empty list of sub-buttons (only 2 levels is supported).
     */
    buttons?: SubButton[];
};

/**
 * A sub-button that will (always) be shown as a sub-menu entry
 */
export type SubButton = {
    /**
     * Label for menu entry
     */
    label: string;

    /**
     * Whether the button is disabled. Defaults to `false`.
     */
    disabled?: boolean;

    /**
     * The callback to call when button was clicked.
     */
    click: (subButton: SubButton, event: Event) => void;
};
