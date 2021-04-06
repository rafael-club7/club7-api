import Classes from '../System/Classes';

export interface IServicoResgatado
{
    id: string;
    usuario: string;
    servico: string;
    data: string;
    status: string|number;
}

class ServicoResgatado extends Classes {
    static table = 'servico_resgatado';

    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'usuario', type: 'string', required: true },
        { name: 'servico', type: 'string', required: true },
        { name: 'data', type: 'string', required: true },
        { name: 'status', type: 'number', required: false }
    ];
}

export default ServicoResgatado;
