import {Inject, Optional, Pipe, PipeTransform} from '@angular/core';

function isDate(value: any): value is Date {
    return value instanceof Date && !isNaN(value.valueOf());
}

/**
 * Returns a string to approximately describe the date.
 *
 * Eg:
 *
 * - "il y a quelques minutes"
 * - "dans 3 jours"
 * - "dans 3 ans"
 */
@Pipe({
    name: 'timeAgo',
})
export class NaturalTimeAgoPipe implements PipeTransform {
    public constructor(
        @Optional() @Inject('SHOULD_NEVER_BE_INJECTED') private readonly fakedNow: number | null = null,
    ) {}

    private getNow(): number {
        return this.fakedNow ?? Date.now();
    }

    public transform(date: Date | string | null | undefined): string {
        if (!date) {
            return '';
        }

        const stamp = isDate(date) ? date.getTime() : Date.parse(date);
        const now = this.getNow();

        const $seconds = (stamp - now) / 1000;
        const minutes = $seconds / 60;
        const hours = minutes / 60;
        const days = hours / 24;
        const weeks = days / 7;
        const months = days / 31;
        const years = days / 365;

        // Find out the best unit to use for display
        if (years <= -2) {
            const value = Math.round(Math.abs(years));
            return $localize`il y a ${value} ans`;
        } else if (years <= -1) {
            return $localize`il y a un an`;
        } else if (months <= -2) {
            const value = Math.round(Math.abs(months));
            return $localize`il y a ${value} mois`;
        } else if (months <= -1) {
            return $localize`il y a un mois`;
        } else if (weeks <= -2) {
            const value = Math.round(Math.abs(weeks));
            return $localize`il y a ${value} semaines`;
        } else if (weeks <= -1) {
            return $localize`il y a une semaine`;
        } else if (days <= -2) {
            const value = Math.round(Math.abs(days));
            return $localize`il y a ${value} jours`;
        } else if (days <= -1) {
            return $localize`il y a un jour`;
        } else if (hours <= -2) {
            const value = Math.round(Math.abs(hours));
            return $localize`il y a ${value} heures`;
        } else if (hours <= -1) {
            return $localize`il y a une heure`;
        } else if (minutes <= -5) {
            const value = Math.round(Math.abs(minutes));
            return $localize`il y a ${value} minutes`;
        } else if (minutes <= 0) {
            return $localize`il y a quelques minutes`;
        } else if (years > 2) {
            const value = Math.round(years);
            return $localize`dans ${value} ans`;
        } else if (years > 1) {
            return $localize`dans un an`;
        } else if (months > 2) {
            const value = Math.round(months);
            return $localize`dans ${value} mois`;
        } else if (months > 1) {
            return $localize`dans un mois`;
        } else if (weeks > 2) {
            const value = Math.round(weeks);
            return $localize`dans ${value} semaines`;
        } else if (weeks > 1) {
            return $localize`dans une semaine`;
        } else if (days > 2) {
            const value = Math.round(days);
            return $localize`dans ${value} jours`;
        } else if (days > 1) {
            return $localize`dans un jour`;
        } else if (hours > 2) {
            const value = Math.round(hours);
            return $localize`dans ${value} heures`;
        } else if (hours > 1) {
            return $localize`dans une heure`;
        } else if (minutes > 5) {
            const value = Math.round(minutes);
            return $localize`dans ${value} minutes`;
        } else if (minutes > 0) {
            return $localize`dans quelques minutes`;
        } else {
            throw new Error('Time travelling just happened');
        }
    }
}
