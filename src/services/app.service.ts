import { ServerService } from './server.service'
import { RegistryService } from "./registry.service";

/**
 * Responsible for application startup and initial configuration.
 * Uses RAII idiom.
 */
export class AppService {
    private server: ServerService;

    constructor() {
        this.server = new ServerService(
            new RegistryService()
        );
    }
}