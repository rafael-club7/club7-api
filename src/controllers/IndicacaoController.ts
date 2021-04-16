import { Router } from 'express';
import Assinatura, { IAssinatura, getFormasPagamentoName } from '../classes/Assinatura';
import Util from '../System/Util';
import Usuario, { IUsuario } from '../classes/Usuario';
import { x64 } from 'crypto-js';

const routes = Router();

// [GET] => /indicacoes
routes.get(`/indicacoes`, async (req, res) => {
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const valor_plano = 49;

    const recursivo = async (usuario: IUsuario, nivel = 0) => {
        if (!Usuario.hasPlanoAtivo(usuario.id))
            return [];
        
        nivel++;

        const indicados: { [k: string]: any }[] = (await Usuario.getIndicados(usuario.id));

        const getPorcentagem = (nivel: number) => {
            let porcentagem = 0;
            switch (nivel) {
            case 1:
                porcentagem = 0.05;
                break;
            case 2:
                porcentagem = 0.04;
                break;
            case 3:
                porcentagem = 0.03;
                break;
            case 4:
                porcentagem = 0.02;
                break;
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                porcentagem = 0.01;
                break;
            }
            
            return porcentagem;
        };
                
        for (let i = 0; i < indicados.length; i++) {
            indicados[i].valor = Number((valor_plano * getPorcentagem(nivel)).toFixed(2));
            indicados[i].indicados = await recursivo(<IUsuario>indicados[i], nivel);
            const valor_indicados = indicados[i].indicados.reduce((a, b) => {
                return (a + (b.valor_total || 0)) ;
            }, 0);

            indicados[i].valor_total = indicados[i].valor + valor_indicados;            
        }

        if (nivel == 1) {
            return indicados;
        }

        return indicados.map(x => ({ id: x.id, indicados: x.indicados, valor: x.valor, valor_total: x.valor_total }));
    };
    
    const indicacoesAtivas = (await recursivo(<IUsuario>req.usuario)).map(x => ({
        ...x,
        indicados: null
    }));

    resp.status = 1;
    resp.data = {
        valor_mensal: Number(indicacoesAtivas.reduce((a, b : any) => {
            return (a + (b.valor_total || 0)) ;
        }, 0).toFixed(2)),
        indicacoes: indicacoesAtivas
    };
    res.send(resp);
});


export default routes;
