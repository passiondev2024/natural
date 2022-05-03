import {HttpClientModule} from '@angular/common/http';
import {ErrorHandler, ModuleWithProviders, NgModule, Provider, Type} from '@angular/core';
import {
    NaturalErrorHandler,
    NaturalLoggerConfigExtra,
    NaturalLoggerConfigUrl,
    NaturalLoggerExtra,
} from './error-handler';

@NgModule({
    imports: [HttpClientModule],
})
export class NaturalErrorModule {
    public static forRoot(
        url: string | null,
        extraService?: Type<NaturalLoggerExtra>,
    ): ModuleWithProviders<NaturalErrorModule> {
        const providers: Provider[] = [];

        providers.push(
            {
                provide: ErrorHandler,
                useClass: NaturalErrorHandler,
            },
            {
                provide: NaturalLoggerConfigUrl,
                useValue: url,
            },
        );

        if (extraService) {
            providers.push({
                provide: NaturalLoggerConfigExtra,
                useClass: extraService,
            });
        }

        return {
            ngModule: NaturalErrorModule,
            providers: providers,
        };
    }
}
