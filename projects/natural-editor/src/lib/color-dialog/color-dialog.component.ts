import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ifValid} from '@ecodev/natural';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {NaturalIconDirective} from '@ecodev/natural';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

export interface ColorDialogData {
    /**
     * Empty string means no color set at all. Anything else must be a valid CSS color in hexa format.
     *
     * Eg:
     *
     * - `""`
     * - `"#ff4000"`
     */
    color: string;
}

@Component({
    templateUrl: './color-dialog.component.html',
    styleUrls: ['./color-dialog.component.scss'],
    standalone: true,
    imports: [
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        NaturalIconDirective,
        MatFormFieldModule,
        MatInputModule,
    ],
})
export class ColorDialogComponent {
    public readonly colors: string[][] = [
        [
            '#000000',
            '#111111',
            '#1c1c1c',
            '#333333',
            '#666666',
            '#808080',
            '#999999',
            '#b2b2b2',
            '#cccccc',
            '#dddddd',
            '#eeeeee',
            '#ffffff',
        ],
        [
            '#ffff00',
            '#ffbf00',
            '#ff8000',
            '#ff4000',
            '#ff0000',
            '#bf0041',
            '#800080',
            '#55308d',
            '#2a6099',
            '#158466',
            '#00a933',
            '#81d41a',
        ],
        [
            '#ffffd7',
            '#fff5ce',
            '#ffdbb6',
            '#ffd8ce',
            '#ffd7d7',
            '#f7d1d5',
            '#e0c2cd',
            '#dedce6',
            '#dee6ef',
            '#dee7e5',
            '#dde8cb',
            '#f6f9d4',
        ],
        [
            '#ffffa6',
            '#ffe994',
            '#ffb66c',
            '#ffaa95',
            '#ffa6a6',
            '#ec9ba4',
            '#bf819e',
            '#b7b3ca',
            '#b4c7dc',
            '#b3cac7',
            '#afd095',
            '#e8f2a1',
        ],
        [
            '#ffff6d',
            '#ffde59',
            '#ff972f',
            '#ff7b59',
            '#ff6d6d',
            '#e16173',
            '#a1467e',
            '#8e86ae',
            '#729fcf',
            '#81aca6',
            '#77bc65',
            '#d4ea6b',
        ],
        [
            '#ffff38',
            '#ffd428',
            '#ff860d',
            '#ff5429',
            '#ff3838',
            '#d62e4e',
            '#8d1d75',
            '#6b5e9b',
            '#5983b0',
            '#50938a',
            '#3faf46',
            '#bbe33d',
        ],
        [
            '#e6e905',
            '#e8a202',
            '#ea7500',
            '#ed4c05',
            '#f10d0c',
            '#a7074b',
            '#780373',
            '#5b277d',
            '#3465a4',
            '#168253',
            '#069a2e',
            '#5eb91e',
        ],
        [
            '#acb20c',
            '#b47804',
            '#b85c00',
            '#be480a',
            '#c9211e',
            '#861141',
            '#650953',
            '#55215b',
            '#355269',
            '#1e6a39',
            '#127622',
            '#468a1a',
        ],
        [
            '#706e0c',
            '#784b04',
            '#7b3d00',
            '#813709',
            '#8d281e',
            '#611729',
            '#4e102d',
            '#481d32',
            '#383d3c',
            '#28471f',
            '#224b12',
            '#395511',
        ],
        [
            '#443205',
            '#472702',
            '#492300',
            '#4b2204',
            '#50200c',
            '#41190d',
            '#3b160e',
            '#3a1a0f',
            '#362413',
            '#302709',
            '#2e2706',
            '#342a06',
        ],
    ];

    public readonly colorControl = new FormControl('', {
        validators: Validators.pattern(/^#\p{Hex_Digit}{6}/u),
        nonNullable: true,
    });
    public readonly form = new FormGroup({
        color: this.colorControl,
    });

    public constructor(
        @Inject(MAT_DIALOG_DATA) data: ColorDialogData,
        private dialogRef: MatDialogRef<ColorDialogComponent, ColorDialogData>,
    ) {
        this.form.setValue(data);
    }

    public maybeConfirm(): void {
        ifValid(this.form).subscribe(() => this.confirm());
    }

    private confirm(): void {
        this.dialogRef.close(this.form.getRawValue());
    }

    public selectColor(color: string): void {
        this.colorControl.setValue(color);
        this.maybeConfirm();
    }
}
