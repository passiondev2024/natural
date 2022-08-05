import {Directive, Inject} from '@angular/core';
import {BehaviorSubject, merge, Observable} from 'rxjs';
import {FilterGroupConditionField} from '../search/classes/graphql-doctrine.types';
import {NATURAL_DROPDOWN_DATA, NaturalDropdownData} from '../search/dropdown-container/dropdown.service';
import {DropdownComponent} from '../search/types/dropdown-component';
import {FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {PossibleDiscreteOperatorKeys, possibleDiscreteOperators} from './types';
import {startWith} from 'rxjs/operators';

@Directive()
export abstract class AbstractAssociationSelectComponent<C> implements DropdownComponent {
    public readonly configuration: C;
    public readonly renderedValue = new BehaviorSubject<string>('');

    public requireValueCtrl = false;
    public readonly operators = possibleDiscreteOperators;
    public readonly operatorCtrl = new FormControl<PossibleDiscreteOperatorKeys>('is', {nonNullable: true});
    public readonly valueCtrl = new FormControl();
    public readonly form = new FormGroup({
        operator: this.operatorCtrl,
        value: this.valueCtrl,
    });

    public constructor(@Inject(NATURAL_DROPDOWN_DATA) data: NaturalDropdownData<C>) {
        this.configuration = data.configuration;

        // Immediately initValidators and everytime the operator change later
        this.operatorCtrl.valueChanges.pipe(startWith(null)).subscribe(() => this.initValidators());

        merge(this.operatorCtrl.valueChanges, this.valueCtrl.valueChanges).subscribe(() => {
            const rendered = this.getRenderedValue();
            this.renderedValue.next(rendered);
        });

        this.reloadCondition(data.condition);
    }

    /**
     * Reload the value from API (`operatorCtrl` should not be touched)
     */
    protected abstract reloadValue(condition: FilterGroupConditionField): Observable<unknown>;

    protected abstract renderValueWithoutOperator(): string;

    public abstract getCondition(): FilterGroupConditionField;

    public isValid(): boolean {
        return this.form.valid;
    }

    public isDirty(): boolean {
        return this.form.dirty;
    }

    private initValidators(): void {
        const whitelist: PossibleDiscreteOperatorKeys[] = ['is', 'isnot'];
        this.requireValueCtrl = whitelist.includes(this.operatorCtrl.value);
        const validators: ValidatorFn[] = this.requireValueCtrl ? [Validators.required] : [];

        this.valueCtrl.setValidators(validators);
        this.valueCtrl.updateValueAndValidity();
    }

    private reloadCondition(condition: FilterGroupConditionField | null): void {
        if (!condition) {
            return;
        }

        const operatorKey = this.conditionToOperatorKey(condition);
        this.operatorCtrl.setValue(operatorKey);

        this.reloadValue(condition).subscribe(value => {
            this.valueCtrl.setValue(value);
            this.renderedValue.next(this.getRenderedValue());
        });
    }

    protected getRenderedValue(): string {
        const operator = this.operators.find(v => v.key === this.operatorCtrl.value);
        if (!operator || !this.isValid()) {
            return '';
        }

        const selection = this.renderValueWithoutOperator();

        return [operator.label, selection].filter(v => v).join(' ');
    }

    protected conditionToOperatorKey(condition: FilterGroupConditionField): PossibleDiscreteOperatorKeys {
        if (condition.have && !condition.have.not) {
            return 'is';
        } else if (condition.have && condition.have.not) {
            return 'isnot';
        } else if (condition.empty && condition.empty.not) {
            return 'any';
        } else if (condition.empty && !condition.empty.not) {
            return 'none';
        }

        return 'is';
    }

    protected operatorKeyToCondition(key: PossibleDiscreteOperatorKeys, values: string[]): FilterGroupConditionField {
        switch (key) {
            case 'is':
                return {have: {values: values}};
            case 'isnot':
                return {have: {values: values, not: true}};
            case 'any':
                return {empty: {not: true}};
            case 'none':
                return {empty: {not: false}};
            default:
                throw new Error('Unsupported operator key: ' + key);
        }
    }
}
