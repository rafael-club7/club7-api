import Classes from '../System/Classes';

export interface IUsuario {
    id: string;
    nome: string;
    nome_normalizado: string;
    email: string;
    senha: string;
    cpf: string;
    data_criacao: string;
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
        { name: 'indicado', type: 'string', required: false },
        { name: 'data_criacao', type: 'string', required: false }
    ];
}

export default Usuario;
