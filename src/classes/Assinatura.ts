import Classes from '../System/Classes';
import { IUsuario } from './Usuario';

export const FormasPagamento = [
    { id: 1, label: "Cartão de Crédito", name: "CARTAO_CREDITO" },
    { id: 2, label: "Boleto", name: "BOLETO" },
];

export const getFormasPagamentoName = (forma : number) : string => {
    return FormasPagamento.find(x => x.id === forma).name;
};

export const getFormasPagamentoLabel = (forma : number) : string => {
    return FormasPagamento.find(x => x.id === forma).label;
};

export interface IAssinatura
{
    id: string;
    usuario: string;
    plano: string;
    forma_pagamento: number;
    valor: number|string;
    valor_centavos?: number|string;
    data_inicio: string;
    status: string|number;
    cartao?: string;

    titular?: IUsuario;
}

class Assinatura extends Classes {
    static table = 'assinatura';

    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'usuario', type: 'string', required: true },
        { name: 'plano', type: 'string', required: true },
        { name: 'forma_pagamento', type: 'number', required: true },
        { name: 'cartao', type: 'object', required: false },
        { name: 'valor', type: 'number', required: false },
        { name: 'data_inicio', type: 'string', required: false },
        { name: 'status', type: 'number', required: false }
    ];

    static async Validate (data: {[k:string]: any}) : Promise<{ msg: string; }[]> {
        const errors = [];
        

        for(const field of this.fields){
            
            if ((typeof data[field.name] === 'undefined' || [null, ''].includes(<string>data[field.name])) && field.required) {
                errors.push({
                    msg: `Campo '${field.name}' é obrigatório!`
                });
            } 

            if (!(typeof data[field.name] === 'undefined' || [null, ''].includes(<string>data[field.name])) && typeof data[field.name] !== field.type) {
                errors.push({
                    msg: `Campo '${field.name}' precisa ser do tipo '${field.type}'!`
                });
            }
        }

        if(getFormasPagamentoName(data.forma_pagamento) === "CARTAO_CREDITO"){
            if(typeof data['cartao'] === 'undefined'){
                errors.push({
                    msg: `O campo "cartao" é obrigatório!`
                });
            }else{

                if(typeof data['cartao'] !== 'object'){
                    errors.push({
                        msg: `Campo 'cartao' precisa ser do tipo 'object'!`
                    });
                }else{
                    for (const campo of [ 'numero', 'vencimento', 'nome', 'cvv' ]) {
                        if (typeof data.cartao[campo] === 'undefined' || [null, ''].includes(<string>data.cartao[campo])) {
                            errors.push({
                                msg: `Campo 'cartao.${campo}' é obrigatório!`
                            });
                        }
                    }
                }

            }
        }
        
        if(getFormasPagamentoName(data.forma_pagamento) === "BOLETO"){
            if(typeof data['endereco'] === 'undefined'){
                errors.push({
                    msg: `O campo "endereco" é obrigatório!`
                });
            }else{

                if(typeof data['endereco'] !== 'object'){
                    errors.push({
                        msg: `Campo 'endereco' precisa ser do tipo 'object'!`
                    });
                }else{
                    for (const campo of [ 'rua', 'cep', 'numero', 'bairro', 'cidade', 'estado' ]) {
                        if (typeof data.endereco[campo] === 'undefined' || [null, ''].includes(<string>data.endereco[campo])) {
                            errors.push({
                                msg: `Campo 'endereco.${campo}' é obrigatório!`
                            });
                        }
                    }
                }

            }
        }
        



        return errors;
    }

}

export default Assinatura;
