import { Router } from 'express';
import ServicoResgatado, { IServicoResgatado } from '../classes/ServicoResgatado';
import Servico, { IServico, getTipoResgateName } from '../classes/Servico';
import Util from '../System/Util';
import Usuario, { IUsuario } from '../classes/Usuario';

const routes = Router();


// [POST] => /servico-resgatado
routes.post(`/servico-resgatado`, async (req, res) => {
    const { body } = req;

    const resp = {
        status: 0,
        data: null,
        errors: [],
        msg: ''
    };

    resp.errors = await ServicoResgatado.Validate(body);

    if (resp.errors.length > 0)
        return res.status(400).send(resp);

    const servico = <IServico>await Servico.GetFirst(`id = '${body.servico}'`);
    if (servico === null) {
        resp.errors.push({
            msg: "Servico mão encontrado"
        });
        return res.status(404).send(resp);
    }

    const hoje = new Date();

    if (servico.validade !== null && new Date(servico.validade) < hoje) {
        resp.errors.push({
            msg: "Esse servico não está mais disponível"
        });
        return res.status(400).send(resp);
    }

    if (getTipoResgateName(Number(servico.tipo_resgate)) === "UNICO") {
        const jaResgatado = <IServicoResgatado>await ServicoResgatado.GetFirst(`servico = '${body.servico}' AND usuario = '${req.usuario.id}'`);
        if (jaResgatado !== null) {
            resp.errors.push({
                msg: "Você já resgatou esse benefício!"
            });
            return res.status(403).send(resp);
        }
    }

    if (getTipoResgateName(Number(servico.tipo_resgate)) === "MENSAL") {
        const mesPassado = new Date();
        mesPassado.setMonth(hoje.getMonth() - 1);
        mesPassado.setHours(0);
        mesPassado.setMinutes(0);
        mesPassado.setSeconds(0);

        const jaResgatado = <IServicoResgatado>await ServicoResgatado.GetFirst(`servico = '${body.servico}' AND usuario = '${req.usuario.id}' AND data >= '${mesPassado.toJSON()}'`);
        if (jaResgatado !== null) {
            resp.errors.push({
                msg: "Você já resgatou esse benefício no ultimo mês!"
            });
            return res.status(403).send(resp);
        }
    }

    hoje.setHours(0);
    hoje.setMinutes(0);
    hoje.setSeconds(0);

    const servicoResgatadoHoje = <IServicoResgatado>await ServicoResgatado.GetFirst(`parceiro = '${servico.parceiro}' AND data > '${hoje.toJSON()}' AND usuario = '${req.usuario.id}'`);
    if (servicoResgatadoHoje !== null) {
        resp.errors.push({
            msg: "Você já resgatou um serviço aqui hoje!"
        });
        return res.status(400).send(resp);
    }

    const payload: IServicoResgatado = {
        id: Util.GUID(),
        codigo: Util.UID(),
        data: new Date().toJSON(),
        servico: body.servico,
        usuario: req.usuario.id,
        parceiro: servico.parceiro,
        status: 1
    };


    const create = await ServicoResgatado.Create(payload);
    if (create.status !== 1) {
        resp.errors.push({
            msg: "Não foi possivel resgatar esse serviço!"
        });
        return res.status(500).send(resp);
    }

    resp.status = 1;
    resp.msg = "Serviço resgatado com sucesso!";
    resp.data = payload;
    res.send(resp);
});

// [GET] => /servico-resgatado
routes.get(`/servico-resgatado`, async (req, res) => {
    const { query } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    let where = (query.where) ? Util.utf8Decode(unescape(String(query.where.toString().replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')))) : '';
    const order_by = String((query.order_by) ? query.order_by : '');
    const limit = String((query.limit) ? query.limit : '');

    if (req.usuario.tipo === 1)
        where = (where !== '') ? `(${where}) AND usuario = '${req.usuario.id}'` : `usuario = '${req.usuario.id}'`;

    if (req.usuario.tipo === 2)
        where = (where !== '') ? `(${where}) AND parceiro = '${req.usuario.id}'` : `parceiro = '${req.usuario.id}'`;

    const servicos = <IServicoResgatado[]>await ServicoResgatado.Get(where, order_by, limit);

    for (let i = 0; i < servicos.length; i++) {
        servicos[i].servico_nome = (<IServico>await Servico.GetFirst(`id = '${servicos[i].servico}'`)).nome;
        servicos[i].usuario_nome = (<IUsuario>await Usuario.GetFirst(`id = '${servicos[i].usuario}'`)).nome;
    }

    res.set('X-TOTAL-COUNT', await ServicoResgatado.Count(where));

    resp.status = 1;
    resp.data = servicos;
    res.send(resp);
});

// [GET] => /servico-resgatado/por-servico
routes.get(`/servico-resgatado/por-servico`, async (req, res) => {
    const { query } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const servicoWhere = (query.where) ? Util.utf8Decode(unescape(String(query.where.toString().replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')))) : '';
    const order_by = String((query.order_by) ? query.order_by : '');
    const status = String((query.status) ? query.status : '');
    const limit = String((query.limit) ? query.limit : '');

    const servicoIds = (<IServico[]>await Servico.Get(`nome_normalizado like '${servicoWhere}%' AND parceiro = '${req.usuario.id}'`)).map(x => x.id);
    const where = `${servicoIds.length > 0 ? `servico in ('${servicoIds.join(`', '`)}') AND` : '' }  ${ status !== '' ? `status = ${status} AND ` : '' }  parceiro = '${req.usuario.id}'`;
    let servicos = [];

    if(!(servicoIds.length === 0 && servicoWhere !== '')){
        servicos = <IServicoResgatado[]>await ServicoResgatado.Get(where, order_by, limit);
    
        for (let i = 0; i < servicos.length; i++) {
            servicos[i].servico_nome = (<IServico>await Servico.GetFirst(`id = '${servicos[i].servico}'`)).nome;
            servicos[i].usuario_nome = (<IUsuario>await Usuario.GetFirst(`id = '${servicos[i].usuario}'`)).nome;
        }

        res.set('X-TOTAL-COUNT', await ServicoResgatado.Count(where));
    }

    resp.status = 1;
    resp.data = servicos;
    res.send(resp);
});

// [POST] => /servico-resgatado/:codigo
routes.post(`/servico-resgatado/:codigo`, async (req, res) => {
    const { params } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const servicoResgatado = <IServicoResgatado>await ServicoResgatado.GetFirst(`codigo = '${params.codigo}' AND parceiro = '${req.usuario.id}'`);

    if (servicoResgatado === null) {
        resp.errors.push({
            msg: "Código não encontrado!"
        });
        return res.status(404).send(resp);
    }

    if (servicoResgatado.status === 2) {
        resp.errors.push({
            msg: "Esse serviço já foi validado!"
        });
        return res.status(403).send(resp);
    }

    const update = await ServicoResgatado.Update({ status: 2 }, `codigo = '${params.codigo}' AND parceiro = '${req.usuario.id}'`);
    if (update.status !== 1) {
        resp.errors.push({
            msg: "Erro ao validar serviço!"
        });
        return res.status(500).send(resp);
    }

    const servico = <IServico>await Servico.GetFirst(`id = '${servicoResgatado.servico}'`);

    resp.status = 1;
    resp.msg = "Serviço resgatado com sucesso!";
    resp.data = servico;
    res.send(resp);
});

// [GET] => /servico-resgatado/:id
routes.get(`/servico-resgatado/:id`, async (req, res) => {
    const { params } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    let where = `id = '${params.id}'`;
    if (req.usuario.tipo === 1)
        where = `(${where}) AND usuario = '${req.usuario.id}'`;

    if (req.usuario.tipo === 2)
        where = `(${where}) AND parceiro = '${req.usuario.id}'`;

    const servico = <IServicoResgatado>await ServicoResgatado.GetFirst(where);

    resp.status = 1;
    resp.data = servico;
    res.send(resp);
});

// [PUT] => /servico-resgatado/:id


// [DELETE] => /servico-resgatado/:id


export default routes;
