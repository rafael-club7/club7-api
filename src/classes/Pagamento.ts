import Classes from '../System/Classes';

export interface IPagamento
{
    id: string;
    assinatura: string;
    tipo_pagamento: string;
    referencia: string;
    valor: number;
    data: string;
    status: string|number;
}


class Pagamento extends Classes {
    static table = 'pagamento';
    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'assinatura', type: 'string', required: true },
        { name: 'tipo_pagamento', type: 'string', required: false },
        { name: 'referencia', type: 'string', required: false },
        { name: 'valor', type: 'number', required: true },
        { name: 'data', type: 'string', required: false },
        { name: 'status', type: 'number', required: false }
    ];

}

export default Pagamento;
