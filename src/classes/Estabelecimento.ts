import Classes from '../System/Classes';

export interface IEstabelecimento
{
    id: string;
    parceiro: string;
    tem_wifi: number;
    wifi_nome: string;
    wifi_senha: string;
    tem_banheiro: number;
    tem_local_descanso: number;
    tem_local_carregar_celular: number;

    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    complemento: string;
    latitude: string;
    longitude: string;
}

class Estabelecimento extends Classes {
    static table = 'estabelecimento';
    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'parceiro', type: 'string', required: false },
        
        { name: 'tem_wifi', type: 'number', required: true },
        { name: 'wifi_nome', type: 'string', required: false },
        { name: 'wifi_senha', type: 'string', required: false },
        
        { name: 'tem_banheiro', type: 'number', required: true },
        { name: 'tem_local_descanso', type: 'number', required: true },
        { name: 'tem_local_carregar_celular', type: 'number', required: true },

        { name: 'rua', type: 'string', required: true },
        { name: 'numero', type: 'string', required: true },
        { name: 'bairro', type: 'string', required: true },
        { name: 'cidade', type: 'string', required: true },
        { name: 'estado', type: 'string', required: true },
        { name: 'cep', type: 'string', required: true },
        { name: 'complemento', type: 'string', required: false },
        { name: 'latitude', type: 'string', required: false },
        { name: 'longitude', type: 'string', required: false },
    ];

    static async Validate (data: {[k:string]: any}) : Promise<{ msg: string; }[]> {
        const parentValidate = Classes.Validate.bind(Estabelecimento);

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

export default Estabelecimento;
