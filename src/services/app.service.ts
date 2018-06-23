import { ServerService } from './server.service'
import { ImportService } from "./import.service";
import { RegistryService } from './registry.service';
/**
 * Responsible for application startup and initial configuration.
 * Uses RAII idiom.
 */
export class AppService {
    private server: ServerService;
    /**
     * Creates and initializes an instance of the AppService class
     */
    constructor() {
        this.server = new ServerService(
            new ImportService(),
            new RegistryService()
        );
    }
}