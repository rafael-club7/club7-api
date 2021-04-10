import Classes from '../System/Classes';

export interface IPlano
{
    id: string;
    nome: string;
    nome_normalizado: string;
    valor: number|string;
    status: string|number;
}

class Plano extends Classes {
    static table = 'plano';

    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'nome', type: 'string', required: true },
        { name: 'nome_normalizado', type: 'string', required: false },
        { name: 'valor', type: 'number', required: true },
        { name: 'status', type: 'number', required: false }
    ];
}

export default Plano;
