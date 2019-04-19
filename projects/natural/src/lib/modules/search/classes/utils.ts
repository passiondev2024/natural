import { ItemConfiguration, NaturalSearchConfiguration } from '../types/Configuration';
import { Selection } from '../types/Values';

export function getConfigurationFromSelection(configuration: NaturalSearchConfiguration | null,
                                              selection: Selection): ItemConfiguration | null {

    if (!configuration) {
        return null;
    }

    // return config if found by alias, or if found by field name or null if not found
    return configuration.find(c => c.name != null && c.name === selection.name) ||
           configuration.find(v => v.field === selection.field) ||
           null;
}

export function deepClone(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
}
