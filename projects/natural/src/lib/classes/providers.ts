import {ApplicationConfig, importProvidersFrom} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {localStorageProvider, sessionStorageProvider} from '../modules/common/services/memory-storage';
import {MatSnackBarModule} from '@angular/material/snack-bar';

/**
 * Minimal, global providers for Natural to work
 */
export const naturalProviders: ApplicationConfig['providers'] = [
    importProvidersFrom([MatDialogModule, MatSnackBarModule]),
    sessionStorageProvider,
    localStorageProvider,
];
