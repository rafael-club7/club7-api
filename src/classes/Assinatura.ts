import Classes from '../System/Classes';
import { IUsuario } from './Usuario';

export interface IAssinatura
{
    id: string;
    usuario: string;
    plano: string;
    valor: number|string;
    valor_centavos?: number|string;
    data_inicio: string;
    status: string|number;
    cartao: string;

    titular?: IUsuario;
}

class Assinatura extends Classes {
    static table = 'assinatura';

    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'usuario', type: 'string', required: true },
        { name: 'plano', type: 'string', required: true },
        { name: 'cartao', type: 'object', required: true },
        { name: 'valor', type: 'number', required: false },
        { name: 'data_inicio', type: 'string', required: false },
        { name: 'status', type: 'number', required: false }
    ];

}

export default Assinatura;
