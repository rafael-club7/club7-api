import Classes from '../System/Classes';

export interface ICategoriaEstabelecimento
{
    id: string;
    nome: string;
    nome_normalizado: string;
    icone: string;
    status: string|number;
}

class CategoriaEstabelecimento extends Classes {
    static table = 'categoria_estabelecimento';

    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'nome', type: 'string', required: false },
        { name: 'nome_normalizado', type: 'string', required: false },
        { name: 'icone', type: 'string', required: false },
        { name: 'status', type: 'number', required: false }
    ];
    
}

export default CategoriaEstabelecimento;
