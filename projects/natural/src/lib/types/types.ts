import {PaginatedData} from '../classes/data-source';
import {NaturalAbstractModelService} from '../services/abstract-model.service';

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
          name: string;
          fullName?: string;
      }
    | {
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
    ? Vone
    : never;
/**
 * Extract the Tall type from a NaturalAbstractModelService
 */
export type ExtractTall<P> = P extends NaturalAbstractModelService<
    any,
    any,
    PaginatedData<infer Tall>,
    any,
    any,
    any,
    any,
    any,
    any,
    any
>
    ? Tall
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
    ? Vall
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
    ? Vcreate
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
    ? Vupdate
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
    ? Vdelete
    : never;
