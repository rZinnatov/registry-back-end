import * as https from "https";
import * as csv from "csv-parser";
import { Registry } from "../domain/registry";
import { RegistryRecord } from "../domain/registry-record";
/**
 * Responsible for providing registry data.
 * Uses RAII idiom.
 */
export class RegistryService {
    private url: string
    private tsvParser: any;
    /**
     * Creates and initializes an instance of the RegistryService class
     */
    constructor() {
        this.url = `https://docs.google.com/spreadsheets/d/e/${process.env.SPREADSHEET_ID}/pub?output=tsv`;
        this.tsvParser = csv({
            raw: false, // do not decode to utf-8 strings
            separator: '\t', // specify optional cell separator
            quote: '"', // specify optional quote character
            escape: '"', // specify optional escape character (defaults to quote value)
            newline: '\n', // specify a newline character
            headers: ['id', 'date', 'inventoryId', 'room', 'name', 'amount', 'price'] // Specifing the headers
        });
    }
    /**
     * Gets full registry data
     * @param callback got invoked when registry is ready
     */
    public get(callback: (registry: Registry) => void): void {
        https.get(this.url, (response) => {
            const records: RegistryRecord[] = [];
            response
                .pipe(this.tsvParser)
                .on('data', (record) => records.push(
                    new RegistryRecord(
                        record.id ? Number(record.id) : -1,
                        record.name ? record.name : '',
                        record.date ? new Date(record.date) : null,
                        record.inventoryId ? record.inventoryId : null,
                        record.room ? Number(record.room) : null,
                        record.amount ? Number(record.amount) : null,
                        record.price ? Number(record.price) : null
                    ))
                ).on('end', () => callback(new Registry(records)))
            ;
        });
    }
}