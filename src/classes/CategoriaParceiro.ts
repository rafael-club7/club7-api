import Classes from '../System/Classes';

export interface ICategoriaParceiro
{
    id: string;
    nome: string;
    nome_normalizado: string;
    icone?: string;
    status: string|number;
}

class CategoriaParceiro extends Classes {
    static table = 'categoria_parceiro';

    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'nome', type: 'string', required: true },
        { name: 'nome_normalizado', type: 'string', required: false },
        { name: 'icone', type: 'string', required: false },
        { name: 'status', type: 'number', required: false }
    ];
    
}

export default CategoriaParceiro;
