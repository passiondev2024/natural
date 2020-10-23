export type FileModel = {
    __typename?: 'File' | 'AccountingDocument' | 'Image';
    id?: string;
    file?: File;
    mime?: string;
    src?: string;
};
