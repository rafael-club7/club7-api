
const database = require('../../database/connection');

export interface DataInterface extends Object{
    id?: string;
    deleted?: number;
}

class DB extends Object {
    table: string;
    where: string;
    _limit: string;
    _offset: string;
    _orderby: string;
    deleted: number;

    constructor (table: string) {
        super();
        this.table = table;
    }

    Where (where: string) : void {
        this.where = where;
    }

    Limit (limit: string) : void {
        this._limit = limit;
    }

    OrderBy (orderby: string) : void {
        this._orderby = orderby;
    }

    async Query (query: string) : Promise<DataInterface[]> {
        return await database.raw(query);
    }

    async Get () : Promise<DataInterface[]> {
        const where = (this.where !== '' && this.where !== undefined) ? `(${this.where}) AND deleted = 0` : 'deleted = 0';
        const orderby = (this._orderby) ? this._orderby : 'id desc';
        let limit = (this._limit) ? this._limit : '1000000';
        let offset = (this._offset) ? this._offset : 0;

        if (limit) {
            if (limit.toString().indexOf(',') >= 0) {
                offset = limit.split(',')[0].replace(/\D+/g, '');
                limit = limit.split(',')[1].replace(/\D+/g, '');
            }
        }

        const data = await database(this.table)
            .whereRaw(where)
            .orderByRaw(orderby)
            .limit(limit)
            .offset(offset);

        return data;
    }

    async GetIncludeDeleted () : Promise<DataInterface[]> {
        const where = (this.where !== '' && this.where !== undefined) ? `(${this.where})` : '';
        const orderby = (this._orderby) ? this._orderby : 'id desc';
        let limit = (this._limit) ? this._limit : '1000000';
        let offset = (this._offset) ? this._offset : 0;

        if (limit) {
            if (limit.toString().indexOf(',') >= 0) {
                offset = limit.split(',')[0].replace(/\D+/g, '');
                limit = limit.split(',')[1].replace(/\D+/g, '');
            }
        }

        const data = await database(this.table)
            .whereRaw(where)
            .orderByRaw(orderby)
            .limit(limit)
            .offset(offset);

        return data;
    }

    async Insert () : Promise<DataInterface> {
        const obj = {};

        for (const param in this) {
            if (Object.prototype.hasOwnProperty.call(this, param)) {
                const ignore = ['table', 'where', 'db'];

                const field = this[param];
                if (typeof (field) === 'function' || ignore.includes(param)) { continue; }

                obj[String(param)] = field;
            }
        }

        return await database(this.table).insert(obj);
    }

    async Update () : Promise<DataInterface> {
        const where = (this.where !== '' && this.where !== undefined) ? `(${this.where}) AND deleted = 0` : 'deleted = 0';

        const obj = {};

        for (const param in this) {
            if (Object.prototype.hasOwnProperty.call(this, param)) {
                const ignore = ['table', 'where', 'db'];

                const field = this[param];
                if (typeof (field) === 'function' || ignore.includes(param)) { continue; }

                obj[String(param)] = field;
            }
        }

        return await database(this.table)
            .whereRaw(where)
            .update(obj);
    }

    async Delete () : Promise<DataInterface> {
        const where = this.where;

        const del = await database(this.table)
            .whereRaw(where)
            .del();

        return del;
    }
}

export default DB;
