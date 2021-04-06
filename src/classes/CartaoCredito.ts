import Classes from '../System/Classes';

export interface ICartaoCredito
{
    id: string;
    usuario: string;
    nome: string;
    numero: number;
    mes: number;
    ano: number;
    cvv: number;
    status: string|number;
}

class CartaoCredito extends Classes {
    static table = 'cartao_credito';
    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'usuario', type: 'string', required: true },
        { name: 'nome', type: 'string', required: true },
        { name: 'numero', type: 'string', required: true },
        { name: 'mes', type: 'string', required: true },
        { name: 'ano', type: 'string', required: true },
        { name: 'cvv', type: 'string', required: true },
        { name: 'status', type: 'number', required: false }
    ];
}

export default CartaoCredito;
