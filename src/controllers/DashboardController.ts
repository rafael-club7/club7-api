import { Router } from 'express';
import DB from '../System/DB';
import Servico from '../Classes/Servico';
import ServicoResgatado from '../Classes/ServicoResgatado';

const routes = Router();

// [GET] => /dashboard
routes.get(`/dashboard`, async (req, res) => {
    const { usuario } = req;

    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const esseMes = new Date();
    esseMes.setHours(0, 0, 0, 0);
    esseMes.setDate(1);

    let query = `select `;
    query += `    svc.id,`;
    query += `    svc.nome,`;
    query += `    svc.descricao,`;
    query += `    svc.nome_normalizado,`;
    query += `    svc.parceiro,`;
    query += `    svc.desconto,`;
    query += `    svc.tipo_desconto,`;
    query += `    svc.tipo_resgate,`;
    query += `    svc.validade,`;
    query += `    svc.status,`;
    query += `    (select count(*) from servico_resgatado where servico = svc.id AND data >= '${hoje.toJSON()}' AND status = 2) as resgatados_hoje,`;
    query += `    (select count(*) from servico_resgatado where servico = svc.id AND data >= '${esseMes.toJSON()}' AND status = 2) as resgatados_mes,`;
    query += `    (select count(distinct usuario) from servico_resgatado where servico = svc.id AND status = 2) as clientes, `;
    query += `    (select count(*) from servico_resgatado where servico = svc.id AND status = 2) as total_resgates `;
    query += `from servico svc `;
    query += `where svc.parceiro = '${usuario.id}' AND deleted = 0`;

    const db = new DB("");
    
    const result = <{ [k: string]: any }[]>await db.Query(query);

    const dashboard = {
        servicos_ativos: result.filter(x => Number(x.status) === 1).length,
        servicos_resgatados_hoje: result.reduce((previous, current) => {
            return previous + Number(current.resgatados_hoje);
        }, 0),
        servicos_resgatados_mes: result.reduce((previous, current) => {
            return previous + Number(current.resgatados_mes);
        }, 0),
        clientes: result.reduce((previous, current) => {
            return previous + Number(current.clientes);
        }, 0),
        servicos: result,
        total_servicos: await Servico.Count(`parceiro = '${usuario.id}'`)
    };


    resp.status = 1;
    resp.data = dashboard;
    res.send(resp);
});

export default routes;
