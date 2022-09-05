import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {delay} from 'rxjs/operators';
import {
    FileModel,
    Literal,
    NaturalAbstractModelService,
    NaturalQueryVariablesManager,
    PaginatedData,
    QueryVariables,
    NaturalDebounceService,
} from '@ecodev/natural';

@Injectable({
    providedIn: 'root',
})
export class FileService extends NaturalAbstractModelService<
    FileModel,
    {id: string},
    PaginatedData<FileModel>,
    QueryVariables,
    FileModel,
    {input: FileModel},
    FileModel,
    {id: string; input: Literal},
    boolean,
    {ids: string[]}
> {
    private id = 1;

    public constructor(apollo: Apollo, naturalDebounceService: NaturalDebounceService) {
        super(apollo, naturalDebounceService, 'user', null, null, null, null, null);
    }

    public getFileModel(): FileModel {
        const id = this.id++;
        return {
            id: '' + id,
        };
    }

    public watchAll(
        queryVariablesManager: NaturalQueryVariablesManager<QueryVariables>,
    ): Observable<PaginatedData<FileModel>> {
        return of({
            items: [
                this.getFileModel(),
                this.getFileModel(),
                this.getFileModel(),
                this.getFileModel(),
                this.getFileModel(),
            ],
            length: 20,
            pageIndex: 0,
            pageSize: 5,
        }).pipe(delay(500));
    }

    public getAll(
        queryVariablesManager: NaturalQueryVariablesManager<QueryVariables>,
    ): Observable<PaginatedData<FileModel>> {
        return of({
            items: [
                this.getFileModel(),
                this.getFileModel(),
                this.getFileModel(),
                this.getFileModel(),
                this.getFileModel(),
            ],
            length: 20,
            pageIndex: 0,
            pageSize: 5,
        }).pipe(delay(500));
    }

    public getOne(id: string): Observable<FileModel> {
        return of(this.getFileModel());
    }

    public create(object: FileModel): Observable<FileModel> {
        return of({...object, id: this.id++ as any}).pipe(delay(500));
    }

    public delete(objects: {id: string}[]): Observable<boolean> {
        return of(true).pipe(delay(500));
    }
}
