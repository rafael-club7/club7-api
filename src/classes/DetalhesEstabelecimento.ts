import Classes from '../System/Classes';

export interface IDetalhesEstabelecimento
{
    id: string;
    estabelecimento: string;
    tem_wifi: number;
    wifi_nome: string;
    wifi_senha: string;
    tem_banheiro: number;
    tem_local_descanso: number;
    tem_local_carregar_celular: number;
}

class DetalhesEstabelecimento extends Classes {
    static table = 'detalhes_estabelecimento';
    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'estabelecimento', type: 'string', required: true },
        
        { name: 'tem_wifi', type: 'number', required: true },
        { name: 'wifi_nome', type: 'string', required: false },
        { name: 'wifi_senha', type: 'string', required: false },
        
        { name: 'tem_banheiro', type: 'number', required: true },
        { name: 'tem_local_descanso', type: 'number', required: true },
        { name: 'tem_local_carregar_celular', type: 'number', required: true },
        

    ];
}

export default DetalhesEstabelecimento;
