import Classes from '../System/Classes';

export interface IEstabelecimento
{
    id: string;
    nome: string;
    nome_normalizado: string;
    cnpj: string;
    imagem: string;
    email: string;
    senha: string;
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    complemento: string;
    latitude: string;
    longitude: string;
    categoria: string;
    status: number|string;
}

class Estabelecimento extends Classes {
    static table = 'estabelecimento';

    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'nome', type: 'string', required: true },
        { name: 'nome_normalizado', type: 'string', required: false },
        { name: 'cnpj', type: 'string', required: true },
        { name: 'imagem', type: 'string', required: false },
        { name: 'email', type: 'string', required: true },
        { name: 'senha', type: 'string', required: false },
        { name: 'rua', type: 'string', required: true },
        { name: 'numero', type: 'string', required: true },
        { name: 'bairro', type: 'string', required: true },
        { name: 'cidade', type: 'string', required: true },
        { name: 'estado', type: 'string', required: true },
        { name: 'cep', type: 'string', required: true },
        { name: 'complemento', type: 'string', required: false },
        { name: 'latitude', type: 'string', required: false },
        { name: 'longitude', type: 'string', required: false },
        { name: 'categoria', type: 'string', required: true },
        { name: 'status', type: 'number', required: false }
    ];
    
}

export default Estabelecimento;
