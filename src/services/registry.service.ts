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
    public get(): Promise<Registry> {
        let dispose: () => void;
        return this._getDb()
            .then((mongoClientWrapper) => {
                dispose = mongoClientWrapper.dispose;
                return mongoClientWrapper.recordsCollection
                    .find()
                    .toArray()
                ;
            })
            .then((records) => {
                dispose();
                return new Registry(records);
            })
        ;
    }
    public addOne(record: RegistryRecord): Promise<string> {
        let dispose: () => void;
        return this._getDb()
            .then((mongoClientWrapper) => {
                dispose = mongoClientWrapper.dispose;
                return mongoClientWrapper.recordsCollection.insertOne(record);
            })
            .then((result) => {
                dispose();
                return result.insertedId.toHexString();
            })
        ;
    }
    public addMany(records: RegistryRecord[]): Promise<void> {
        let dispose: () => void;
        return this._getDb()
            .then((mongoClientWrapper) => {
                dispose = mongoClientWrapper.dispose;
                return mongoClientWrapper.recordsCollection.insertMany(records);
            })
            .then((result) => {
                dispose();
                return Promise.resolve();
            })
        ;
    }
    public updateOne(record: RegistryRecord): Promise<void> {
        let dispose: () => void;
        return this._getDb()
            .then((mongoClientWrapper) => {
                dispose = mongoClientWrapper.dispose;
                return mongoClientWrapper.recordsCollection.replaceOne({ '_id': new ObjectID(record.id) }, record);
            })
            .then((result) => {
                dispose();
                return Promise.resolve();
            })
        ;
    }
    public remove(id: string): Promise<void> {
        let dispose: () => void;
        return this._getDb()
            .then((mongoClientWrapper) => {
                dispose = mongoClientWrapper.dispose;
                return mongoClientWrapper.recordsCollection.deleteOne({ '_id': new ObjectID(id) });
            })
            .then((result) => {
                dispose();
                return Promise.resolve();
            })
        ;
    }

    private _getDb(): Promise<MongoClientWrapper> {
        return MongoClient
            .connect(process.env.SIR_CONNECTION_STRING || 'mongodb://localhost:27017')
            .then((mongoClient) => new MongoClientWrapper(
                mongoClient.db('sir').collection<RegistryRecord>('records'),
                () => mongoClient.close()
            ))
        ;
    }
}