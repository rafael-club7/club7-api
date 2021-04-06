import Classes from '../System/Classes';

export interface ICategoriaEstabelecomento
{
    id: string;
    usuario: string;
    data_inicio: string;
    ultima_data: string;
}

class CategoriaEstabelecomento extends Classes {
    static table = 'categoria_estabelecimento';

    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'nome', type: 'string', required: false },
        { name: 'icone', type: 'string', required: false },
        { name: 'status', type: 'number', required: false }
    ];
    
}

export default CategoriaEstabelecomento;
