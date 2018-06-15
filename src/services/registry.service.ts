import * as https from "https";

/**
 * Responsible for providing registry data.
 * Uses RAII idiom.
 */
export class RegistryService {
    private url: string

    constructor() {
        this.url = `https://docs.google.com/spreadsheets/d/e/${process.env.SPREADSHEET_ID}/pub?output=tsv`;
    }

    public get(callback: (registry: string) => void): void {
        https.get(this.url, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk.toString();
            });
            resp.on('end', () => {
                callback(data);
            });
        });
    }
}