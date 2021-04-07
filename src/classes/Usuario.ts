import Classes from '../System/Classes';

export interface IUsuario {
    id: string;
    nome: string;
    nome_normalizado: string;
    email: string;
    senha: string;
    cpf: string;
    data_criacao: string;
    indicado: string;
    tipo: number;
    status: string|number;
}

class Usuario extends Classes {
    static table = 'usuario';

    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'nome', type: 'string', required: true },
        { name: 'nome_normalizado', type: 'string', required: false },
        { name: 'email', type: 'string', required: true },
        { name: 'senha', type: 'string', required: true },
        { name: 'cpf', type: 'string', required: true },
        { name: 'tipo', type: 'number', required: true },
        { name: 'indicado', type: 'string', required: false },
        { name: 'data_criacao', type: 'string', required: false }
    ];

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

        return errors;
    }
}

export default Usuario;
