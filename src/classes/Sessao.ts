import Classes from '../System/Classes';

export interface ISessao
{
    id: string;
    usuario: string;
    data_inicio: string;
    ultima_data: string;
}

class Sessao extends Classes {
    static table = 'sessao';

    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'usuario', type: 'string', required: false },
        { name: 'data_inicio', type: 'string', required: false },
        { name: 'ultima_data', type: 'string', required: false }
    ];
    
}

export default Sessao;
