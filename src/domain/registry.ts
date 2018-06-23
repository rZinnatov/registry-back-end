import { RegistryRecord } from "./registry-record";
/**
 * Describes the invetory register
 */
export class Registry {
    /**
     * Creates and initializes an instance of the Registry class
     */
    constructor(
        public records: RegistryRecord[] = []
    ) {
    }
}