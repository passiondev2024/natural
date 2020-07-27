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
