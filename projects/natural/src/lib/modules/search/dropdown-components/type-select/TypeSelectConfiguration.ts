import { Scalar } from '../../classes/graphql-doctrine.types';
import { Observable } from 'rxjs';

export type TypeSelectItem = Scalar | {
    id: Scalar;
    name: Scalar;
} | {
    value: Scalar;
    name: Scalar;
};

export interface TypeSelectConfiguration {
    items: TypeSelectItem[] | Observable<TypeSelectItem[]>;
    multiple?: boolean;
}

