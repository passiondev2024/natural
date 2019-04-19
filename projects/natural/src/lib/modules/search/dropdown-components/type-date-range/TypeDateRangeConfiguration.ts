export interface TypeDateRangeConfiguration<D = any> {
    min?: D | null;
    max?: D | null;
    fromRequired?: boolean;
    toRequired?: boolean;
}
