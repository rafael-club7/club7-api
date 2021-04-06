import Classes from '../System/Classes';

export interface IServico
{
    id: string;
    nome: string;
    nome_normalizado: string;
    desconto: number;
    tipo: string|number;
    estabelecimento: string;
    status: string|number;
}

class Servico extends Classes {
    static table = 'servico';

    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'nome', type: 'string', required: true },
        { name: 'nome_normalizado', type: 'string', required: false },
        { name: 'estabelecimento', type: 'string', required: true },
        { name: 'desconto', type: 'number', required: true },
        { name: 'tipo', type: 'number', required: true },
        { name: 'status', type: 'number', required: false }
    ];
}

export default Servico;
