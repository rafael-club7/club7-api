/* eslint valid-typeof: "error" */
import DB from './DB';

interface Field
{
    name: string;
    type: string;
    required: boolean;
}

class Classes {
    public static table: string;
    public static fields: Field[];

    static async Validate (data: {[k:string]: any}) : Promise<{ msg: string; }[]> {
        const errors = [];

        for(const field of this.fields){
            
            if ((typeof data[field.name] === 'undefined' || [null, ''].includes(<string>data[field.name])) && field.required) {
                errors.push({
                    msg: `Campo '${field.name}' é obrigatório!`
                });
            } 

            if (!(typeof data[field.name] === 'undefined' || [null, ''].includes(<string>data[field.name])) && typeof data[field.name] !== field.type) {
                errors.push({
                    msg: `Campo '${field.name}' precisa ser do tipo '${field.type}'!`
                });
            }
        }

        return errors;    }

    static async Count (where : string) : Promise<string> {
        const db = new DB(this.table);
        return (where)
            ? (await db.Query(`SELECT count(*) FROM ${this.table} WHERE (${where}) and deleted = 0`))[0]['count(*)']
            : (await db.Query(`SELECT count(*) FROM ${this.table} WHERE deleted = 0 `))[0]['count(*)'];
    }

    static async Get (where : string, order_by = '', limit = '') : Promise<{[k:string]: any}[]> {
        const db = new DB(this.table);
        db.Where(where);
        db.OrderBy(order_by);
        db.Limit(limit);

        const data = (await db.Get()).map(x => {
            const obj = {};
            for (const field of this.fields) {
                obj[field.name] = x[field.name];
            }
            return obj;
        });

        return data;
    }

    static async GetIncludeDeleted (where : string, order_by = '', limit = '') : Promise<{[k:string]: any}[]> {
        const db = new DB(this.table);
        db.Where(where);
        db.OrderBy(order_by);
        db.Limit(limit);

        const data = (await db.GetIncludeDeleted()).map(x => {
            const obj = {};
            for (const field of this.fields) {
                obj[field.name] = x[field.name];
            }
            return obj;
        });

        return data.length > 0 ? data : null;
    }

    static async GetFirst (where : string, order_by = '', limit = '') : Promise<{[k:string]: any} | null> {
        const db = new DB(this.table);
        db.Where(where);
        db.OrderBy(order_by);
        db.Limit(limit);

        const data = (await db.Get()).map(x => {
            const obj = {};
            for (const field of this.fields) {
                obj[field.name] = x[field.name];
            }
            return obj;
        });

        return data.length > 0 ? data[0] : null;
    }

    static async GetFirstIncludeDeleted (where : string, order_by = '', limit = '') : Promise<{[k:string]: any} | null> {
        const db = new DB(this.table);
        db.Where(where);
        db.OrderBy(order_by);
        db.Limit(limit);

        const data = (await db.GetIncludeDeleted()).map(x => {
            const obj = {};
            for (const field of this.fields) {
                obj[field.name] = x[field.name];
            }
            return obj;
        });

        return data.length > 0 ? data[0] : null;
    }

    static async Create (data = {}) : Promise<{ status: number, data: any, msg: string }> {
        if (data === {}) { return null; }
        const db = new DB(this.table);

        for (const dado in data) {
            if (this.fields.find(x => x.name === dado)) { db[dado] = data[dado]; }
        }

        const result = await db.Insert();

        return {
            status: (result) ? 1 : 0,
            data: (result) ? result[0] : null,
            msg: (result) ? 'Criado com sucesso!' : 'Erro ao criar!'
        };
    }

    static async Update (data = {}, where : string) : Promise<{ status: number, data: any, msg: string }> {
        if (data === {}) { return null; }

        const db = new DB(this.table);

        for (const dado in data) {
            if (this.fields.find(x => x.name === dado)) { db[dado] = data[dado]; }
        }

        db.Where(where);

        const result = await db.Update();
        return {
            status: (result) ? 1 : 0,
            data,
            msg: (result) ? 'Atualizado com sucesso!' : 'Erro ao atualizar!'
        };
    }

    static async Delete (where : string, del = false) : Promise<{ status: number, msg: string }> {
        const db = new DB(this.table);
        db.Where(where);

        db.deleted = 1;

        if (!del) {
            const result = await db.Update();
            return {
                status: (result) ? 1 : 0,
                msg: (result) ? 'Excluido com sucesso!' : 'Erro ao excluir!'
            };
        } else {
            const result = await db.Delete();

            return {
                status: (result) ? 1 : 0,
                msg: (result) ? 'Excluido com sucesso!' : 'Erro ao excluir!'
            };
        }
    }
}

export default Classes;
