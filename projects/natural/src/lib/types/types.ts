import {PaginatedData} from '../classes/data-source';
import {NaturalAbstractModelService, VariablesWithInput} from '../services/abstract-model.service';
import {QueryVariables} from '../classes/query-variable-manager';

/**
 * An object literal with any keys and values
 */
export interface Literal {
    [key: string]: any;
}

/**
 * An object with either a name or a fullName (or maybe both)
 */
export type NameOrFullName =
    | {
          id: string;
          name: string;
          fullName?: string;
      }
    | {
          id: string;
          name?: string;
          fullName: string;
      };

/**
 * Extract the Tone type from a NaturalAbstractModelService
 */
export type ExtractTone<P> = P extends NaturalAbstractModelService<
    infer Tone,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
>
    ? Tone
    : never;

/**
 * Extract the Vone type from a NaturalAbstractModelService
 */
export type ExtractVone<P> = P extends NaturalAbstractModelService<
    any,
    infer Vone,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
>
    ? Vone extends {id: string}
        ? Vone
        : never
    : never;

/**
 * Extract the Tall type from a NaturalAbstractModelService
 */
export type ExtractTall<P> = P extends NaturalAbstractModelService<
    any,
    any,
    infer Tall,
    any,
    any,
    any,
    any,
    any,
    any,
    any
>
    ? Tall extends PaginatedData<Literal>
        ? Tall
        : never
    : never;

/**
 * Extract the TallOne type for a single item coming from a list of items from a NaturalAbstractModelService
 */
export type ExtractTallOne<P> = P extends NaturalAbstractModelService<
    any,
    any,
    PaginatedData<infer TallOne extends Literal>,
    any,
    any,
    any,
    any,
    any,
    any,
    any
>
    ? TallOne extends Literal
        ? TallOne
        : never
    : never;

/**
 * Extract the Vall type from a NaturalAbstractModelService
 */
export type ExtractVall<P> = P extends NaturalAbstractModelService<
    any,
    any,
    any,
    infer Vall,
    any,
    any,
    any,
    any,
    any,
    any
>
    ? Vall extends QueryVariables
        ? Vall
        : never
    : never;

/**
 * Extract the Tcreate type from a NaturalAbstractModelService
 */
export type ExtractTcreate<P> = P extends NaturalAbstractModelService<
    any,
    any,
    any,
    any,
    infer Tcreate,
    any,
    any,
    any,
    any,
    any
>
    ? Tcreate
    : never;

/**
 * Extract the Vcreate type from a NaturalAbstractModelService
 */
export type ExtractVcreate<P> = P extends NaturalAbstractModelService<
    any,
    any,
    any,
    any,
    any,
    infer Vcreate,
    any,
    any,
    any,
    any
>
    ? Vcreate extends VariablesWithInput
        ? Vcreate
        : never
    : never;

/**
 * Extract the Tupdate type from a NaturalAbstractModelService
 */
export type ExtractTupdate<P> = P extends NaturalAbstractModelService<
    any,
    any,
    any,
    any,
    any,
    any,
    infer Tupdate,
    any,
    any,
    any
>
    ? Tupdate
    : never;

/**
 * Extract the Vupdate type from a NaturalAbstractModelService
 */
export type ExtractVupdate<P> = P extends NaturalAbstractModelService<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    infer Vupdate,
    any,
    any
>
    ? Vupdate extends {id: string; input: Literal}
        ? Vupdate
        : never
    : never;

/**
 * Extract the Tdelete type from a NaturalAbstractModelService
 */
export type ExtractTdelete<P> = P extends NaturalAbstractModelService<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    infer Tdelete,
    any
>
    ? Tdelete
    : never;

/**
 * Extract the Vdelete type from a NaturalAbstractModelService
 */
export type ExtractVdelete<P> = P extends NaturalAbstractModelService<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    infer Vdelete
>
    ? Vdelete extends {ids: string[]}
        ? Vdelete
        : never
    : never;
