import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'ellipsis'})
export class NaturalEllipsisPipe implements PipeTransform {
    public transform(value: string, limit: number): string {
        return value.substr(0, limit - 1) + (value.length > limit ? '…' : '');
    }
}
