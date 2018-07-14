import { Registry } from "../domain/registry";
import { RegistryRecord } from "../domain/registry-record";
import { MongoClient, Collection, ObjectID } from "mongodb";

class MongoClientWrapper {
    constructor(
        public readonly recordsCollection: Collection<RegistryRecord>,
        public readonly dispose: () => void
    ) { }
}

export class RegistryService {
    public async get(): Promise<Registry> {
        const db = await this._getDb();
        const records = await db.recordsCollection.find().toArray();
        
        db.dispose();

        return new Registry(records);
    }
    public async addOne(record: RegistryRecord): Promise<string> {
        const db = await this._getDb();
        const result = await db.recordsCollection.insertOne(record);

        db.dispose();

        return result.insertedId.toHexString();
    }
    public async addMany(records: RegistryRecord[]): Promise<void> {
        const db = await this._getDb();
        await db.recordsCollection.insertMany(records);

        db.dispose();
    }
    public async updateOne(record: RegistryRecord): Promise<void> {
        const db = await this._getDb();
        await db.recordsCollection.replaceOne({ '_id': new ObjectID(record.id) }, record);

        db.dispose();
    }
    public async remove(id: string): Promise<void> {
        const db = await this._getDb();
        await db.recordsCollection.deleteOne({ '_id': new ObjectID(id) });

        db.dispose();
    }

    private async _getDb(): Promise<MongoClientWrapper> {
        const mongoClient = await MongoClient.connect(process.env.SIR_CONNECTION_STRING || 'mongodb://localhost:27017');
        return new MongoClientWrapper(
            await mongoClient.db('sir').collection<RegistryRecord>('records'),
            () => mongoClient.close()
        );
    }
}