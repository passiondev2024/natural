/// <reference types="@angular/localize" />

/*
 * Public API Surface of natural
 */

export * from './lib/classes/abstract-controller';
export * from './lib/classes/abstract-detail';
export * from './lib/classes/abstract-editable-list';
export * from './lib/classes/abstract-list';
export * from './lib/classes/abstract-navigable-list';
export {createHttpLink} from './lib/classes/apollo-utils';
export * from './lib/classes/data-source';
export * from './lib/classes/query-variable-manager';
export * from './lib/classes/rxjs';
export * from './lib/classes/utility';
export * from './lib/classes/validators';
export {validTlds} from './lib/classes/tld';

export * from './lib/services/abstract-model.service';
export {NaturalDebounceService} from './lib/services/debounce.service';
export * from './lib/services/enum.service';
export * from './lib/services/link-mutation.service';
export {NaturalPersistenceService, NATURAL_PERSISTENCE_VALIDATOR} from './lib/services/persistence.service';
export * from './lib/services/swiss-parsing-date-adapter.service';

export {
    Literal,
    NameOrFullName,
    ExtractTone,
    ExtractVone,
    ExtractTall,
    ExtractTallOne,
    ExtractVall,
    ExtractTcreate,
    ExtractVcreate,
    ExtractTupdate,
    ExtractVupdate,
    ExtractTdelete,
    ExtractVdelete,
    ExtractResolve,
} from './lib/types/types';

export * from './lib/modules/alert/public-api';
export * from './lib/modules/columns-picker/public-api';
export * from './lib/modules/common/public-api';
export * from './lib/modules/detail-header/public-api';
export * from './lib/modules/dropdown-components/public-api';
export * from './lib/modules/file/public-api';
export * from './lib/modules/fixed-button/public-api';
export * from './lib/modules/fixed-button-detail/public-api';
export * from './lib/modules/hierarchic-selector/public-api';
export * from './lib/modules/icon/public-api';
export * from './lib/modules/panels/public-api';
export * from './lib/modules/relations/public-api';
export * from './lib/modules/search/public-api';
export * from './lib/modules/select/public-api';
export * from './lib/modules/sidenav/public-api';
export * from './lib/modules/stamp/public-api';
export * from './lib/modules/table-button/public-api';
export * from './lib/modules/dialog-trigger/public-api';
export * from './lib/modules/avatar/public-api';
export * from './lib/modules/matomo/public-api';
export * from './lib/modules/logger/public-api';

export * from './lib/directives/http-prefix.directive';
export {naturalProviders} from './lib/classes/providers';
export {graphqlQuerySigner} from './lib/classes/signing';
