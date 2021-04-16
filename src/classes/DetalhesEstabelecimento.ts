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
        { name: 'estabelecimento', type: 'string', required: false },
        
        { name: 'tem_wifi', type: 'number', required: true },
        { name: 'wifi_nome', type: 'string', required: false },
        { name: 'wifi_senha', type: 'string', required: false },
        
        { name: 'tem_banheiro', type: 'number', required: true },
        { name: 'tem_local_descanso', type: 'number', required: true },
        { name: 'tem_local_carregar_celular', type: 'number', required: true },
        

    ];

    static async Validate (data: {[k:string]: any}) : Promise<{ msg: string; }[]> {
        const parentValidate = Classes.Validate.bind(DetalhesEstabelecimento);

        const errors = await parentValidate(data);

        if(errors.length > 0)
            return errors;

        if(data['tem_wifi'] === 1){
            for (const field of [ 'wifi_nome', 'wifi_senha' ]) {
                if (typeof data[field] === 'undefined' || [null, ''].includes(<string>data[field])) {
                    errors.push({
                        msg: `Campo '${field}' é obrigatório!`
                    });
                }
            }
        }

        return errors;
    }
}

export default DetalhesEstabelecimento;
