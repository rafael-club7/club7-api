import { Router } from 'express';
import Servico, { IServico } from '../Classes/Servico';
import Usuario, { IUsuario } from '../Classes/Usuario';
import Util from '../System/Util';

const routes = Router();

// [POST] => /servico
routes.post(`/servico`, async (req, res) => {
    const { body } = req;

    const resp = {
        status: 0,
        data: null,
        errors: [],
        msg: ''
    };

    resp.errors = await Servico.Validate(body);

    if (resp.errors.length > 0)
        return res.status(400).send(resp);

    const estabelecimentoExiste = <IUsuario> await Usuario.GetFirst(`id = '${body.estabelecimento}' and tipo = 2`);
    if(estabelecimentoExiste === null){
        resp.errors.push({
            msg: "Estabelecimento não encontrado"
        });
        return res.status(404).send(resp);
    }
    
    const payload : IServico = {
        id: Util.GUID(),
        nome: body.nome,
        nome_normalizado: Util.toNormal(body.nome),
        descricao: body.descricao,
        estabelecimento: body.estabelecimento,
        desconto: body.desconto,
        tipo_desconto: body.tipo_desconto,
        tipo_resgate: body.tipo_resgate,
        validade: body.validade,
        status: 1
    };

    const create = await Servico.Create(payload);

    if(create.status !== 1){
        resp.errors.push({
            msg: "Erro ao cadastrar serviço"
        });
        return res.status(500).send(resp);
    }
    
    resp.status = 1;
    resp.msg = 'Serviço registrado com sucesso!';
    resp.data = payload;
    res.send(resp);
});

// [GET] => /servico
routes.get(`/servico`, async (req, res) => {
    const { query } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const where = (query.where) ? Util.utf8Decode(unescape(String(query.where))) : '';
    const order_by = String((query.order_by) ? query.order_by : '');
    const limit = String((query.limit) ? query.limit : '');

    const servicos = <IServico[]> await Servico.Get(where, order_by, limit);

    res.set('X-TOTAL-COUNT', await Servico.Count(where));

    resp.status = 1;
    resp.data = servicos;
    res.send(resp);
});

// [GET] => /servico/estabelecimento/:id
routes.get('/servico/estabelecimento/:id', async (req, res) => {
    const { params, query } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const estabelecimento = <IUsuario> await Usuario.GetFirst(`id = '${params.id}' and tipo = 2`);
    
    if (estabelecimento === null) {
        resp.errors.push({
            msg: 'Estabelecimento não encontrado!'
        });
        return res.status(404).send(resp);
    }

    let where = (query.where) ? Util.utf8Decode(unescape(String(query.where))) : '';
    const order_by = String((query.order_by) ? query.order_by : '');
    const limit = String((query.limit) ? query.limit : '');

    where = (where === '') ? `estabelecimento = '${estabelecimento.id}'` : `(${where}) AND estabelecimento = '${estabelecimento.id}'`;
    

    const servicos = <IServico[]> await Servico.Get(where, order_by, limit);

    res.set('X-TOTAL-COUNT', await Servico.Count(where));

    resp.status = 1;
    resp.data = servicos;
    res.send(resp);
});

// [GET] => /servico/:id
routes.get('/servico/:id', async (req, res) => {
    const { params } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const servico = <IServico> await Servico.GetFirst(`id = '${params.id}'`);
    
    if (servico === null) {
        resp.errors.push({
            msg: 'Serviço não encontrado!'
        });
        return res.status(404).send(resp);
    }

    resp.status = 1;
    resp.data = servico;
    res.send(resp);
});

// [PUT] => /servico/:id
routes.put('/servico/:id', async (req, res) => {
    const { params, body } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const servicoGet = <IServico> await Servico.GetFirst(`id = '${params.id}'`);
    
    if (servicoGet === null) {
        resp.errors.push({
            msg: 'Serviço não encontrado!'
        });
        return res.status(404).send(resp);
    }

    if(req.usuario.tipo !== 9 && req.usuario.id !== servicoGet.estabelecimento){
        resp.errors.push({
            msg: "Você não tem permissão para editar esse serviço!"
        });
        return res.status(403).send(resp);
    }

    const data : { [k: string] : any} = {};
    
    const proibidos = ['id', 'estabelecimento', 'data_inicio'];
    let edit = false;
    
    Servico.fields.forEach(campo => {
        if (body[campo.name] !== undefined && !proibidos.includes(campo.name)) {
            data[campo.name] = body[campo.name];
            if (campo.name === 'nome') {
                data.nome_normalizado = Util.toNormal(body[campo.name]);
            }
            edit = true;
        }
    });

    if (!edit) {
        resp.errors.push({
            msg: 'Nada para editar'
        });
        return res.status(400).send(resp);
    }

    const update = await Servico.Update(data, `id = '${params.id}'`);

    if (update.status !== 1) {
        resp.errors.push({
            msg: 'Não foi possivel atualizar'
        });

        return res.status(500).send(resp);
    }

    resp.status = 1;
    resp.msg = 'Atualizado com sucesso';
    res.send(resp);
});

// [DELETE] => /servico/:id
routes.delete('/servico/:id', async (req, res) => {
    const { params } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const servicoGet = <IServico> await Servico.GetFirst(`id = '${params.id}'`);

    if (servicoGet === null) {
        resp.errors.push({
            msg: 'Serviço não encontrado!'
        });
        return res.status(404).send(resp);
    }

    if(req.usuario.tipo !== 9 && req.usuario.id !== servicoGet.estabelecimento){
        resp.errors.push({
            msg: "Você não tem permissão para excluir esse registro!"
        });
        return res.status(403).send(resp);
    }

    const del = await Servico.Delete(`id = '${params.id}'`);

    if (del.status !== 1) {
        resp.errors.push({
            msg: 'Não foi possivel excluir'
        });

        return res.status(500).send(resp);
    }

    resp.status = 1;
    resp.msg = 'Excluido com sucesso';
    res.send(resp);
});

export default routes;
