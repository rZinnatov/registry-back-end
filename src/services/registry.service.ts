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
    private csvParserOptions: object
    /**
     * Creates and initializes an instance of the RegistryService class
     */
    constructor() {
        this.url = `https://docs.google.com/spreadsheets/d/e/${process.env.SPREADSHEET_ID}/pub?output=csv`;
        this.csvParserOptions = {
            raw: false, // do not decode to utf-8 strings
            separator: ',', // specify optional cell separator
            quote: '"', // specify optional quote character
            escape: '"', // specify optional escape character (defaults to quote value)
            newline: "\r\n", // specify a newline character
            headers: [ 'id', 'date', 'inventoryId', 'room', 'name', 'amount', 'price', 'comment' ] // Specifing the headers
        };
    }
    /**
     * Gets full registry data
     * @param callback got invoked when registry is ready
     */
    public get(callback: (registry: Registry) => void): void {
        https.get(this.url, (response) => {
            const records: RegistryRecord[] = [];
            response
                .pipe(csv(this.csvParserOptions))
                .on('data', (record) => records.push(
                    new RegistryRecord(
                        record.id ? Number(record.id) : -1,
                        record.name ? record.name : '',
                        record.date ? record.date : null,
                        record.inventoryId ? record.inventoryId : null,
                        record.room ? Number(record.room) : null,
                        record.amount ? Number(record.amount) : null,
                        record.price ? Number(record.price) : null,
                        record.comment ? record.comment : null
                    ))
                ).on('end', () => callback(new Registry(records)))
            ;
        });
    }
}