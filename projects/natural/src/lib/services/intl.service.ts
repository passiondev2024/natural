import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class NaturalIntlService {

    public updated = 'Mis à jour';

    public created = 'Créé';

    public deleteConfirmTitle = 'Suppression';

    public deleteConfirmBody = 'Voulez-vous supprimer définitivement cet élément ?';

    public deleteConfirmButton = 'Supprimer définitivement';

    public deleted = 'Supprimé';

    constructor() {
    }
}
