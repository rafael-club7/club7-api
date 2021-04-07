import Classes from '../System/Classes';
import Util from '../System/Util';

export interface ISessao
{
    id: string;
    usuario: string;
    data_inicio: string;
    ultima_data: string;
}

interface DataResponse {
    status: number;
    msg: string;
    data?: { [k: string] : any };
}

class Sessao extends Classes {
    static table = 'sessao';

    public static fields = [
        { name: 'id', type: 'string', required: false },
        { name: 'usuario', type: 'string', required: false },
        { name: 'data_inicio', type: 'string', required: false },
        { name: 'ultima_data', type: 'string', required: false }
    ];
    
    static async Verificar (sid : string) : Promise<DataResponse> {
        const sessao = <ISessao>(await this.GetFirst(`id = '${sid}'`));

        const resp = {
            status: 0,
            msg: '',
            data: sessao,
            id: sid
        };

        if (!sessao) {
            resp.msg = 'Sessão não encontrada';
            return resp;
        }

        if (new Date(sessao.ultima_data) < new Date(Util.HoursAgo(5) * 1000)) {
            resp.msg = 'Sessão expirada';
            return resp;
        }

        return {
            ...resp,
            status: 1,
            msg: 'Sessão válida'
        };
    }

}

export default Sessao;
