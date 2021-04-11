import { Router } from 'express';
import Usuario, { IUsuario } from '../classes/Usuario';
import Util from '../System/Util';

const routes = Router();

// [POST] => /usuario
routes.post(`/usuario`, async (req, res) => {
    const { body } = req;

    const resp = {
        status: 0,
        data: null,
        errors: [],
        msg: ''
    };

    resp.errors = await Usuario.Validate(body);

    if (resp.errors.length > 0) {
        return res.status(400).send(resp);
    }

    const payload = {
        id: Util.GUID(),
        ...body,
        cpf: body.cpf.toString().replace(/\D+/g, ''),
        nome_normalizado: Util.toNormal(body.nome),
        data_criacao: new Date().toJSON(),
    };

    payload.senha = Util.Encrypt(body.senha, payload.id);

    if (!Util.validaCpf(body.cpf)) {
        resp.errors.push({
            msg: "CPF inválido!"
        });
        return res.status(400).send(resp);
    }

    if (!['', null, undefined].includes(body.indicado)) {
        const indicacaoExiste = await Usuario.GetFirst(`id = '${body.indicado}'`);
        if (indicacaoExiste === null) {
            resp.errors.push({
                msg: "Usuário de indicação não encontrado"
            });
            return res.status(404).send(resp);
        }
    }

    const usuarioExiste = await Usuario.GetFirst(`cpf = '${payload.cpf}' OR email = '${payload.email}'`);
    if (usuarioExiste !== null) {
        if (usuarioExiste.email === payload.email) {
            resp.errors.push({
                msg: "Este email já está sendo utilizado"
            });
        }

        if (usuarioExiste.cpf === payload.cpf) {
            resp.errors.push({
                msg: "Este CPF já está sendo utilizado"
            });
        }

        if (resp.errors.length > 0) {
            return res.status(400).send(resp);
        }
    }

    const create = await Usuario.Create(payload);
    if (create.status !== 1) {
        resp.errors.push({
            msg: "Erro ao inserir usuário"
        });
        return res.status(500).send(resp);
    }


    resp.status = 1;
    resp.msg = 'Usuário criado com sucesso!';
    resp.data = payload;
    res.send(resp);
});

// [GET] => /usuario
routes.get(`/usuario`, async (req, res) => {
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

    const usuarios = <IUsuario[]> await Usuario.Get(where, order_by, limit);

    res.set('X-TOTAL-COUNT', await Usuario.Count(where));

    resp.status = 1;
    resp.data = usuarios;
    res.send(resp);
});

// [GET] => /usuario/:id
routes.get('/usuario/:id', async (req, res) => {
    const { params } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    if(req.usuario.tipo !== 9 && req.usuario.id !== params.id){
        resp.errors.push({
            msg: "Você não tem permissão para visualizar esse usuário!"
        });
        return res.status(403).send(resp);
    }

    const usuario = <IUsuario> await Usuario.GetFirst(`id = '${params.id}'`);

    if (usuario === null) {
        resp.errors.push({
            msg: 'Usuário não encontrado!'
        });
        return res.status(404).send(resp);
    }

    resp.status = 1;
    resp.data = usuario;
    res.send(resp);
});

// [PUT] => /usuario/:id
routes.put('/usuario/:id', async (req, res) => {
    const { params, body } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    if(req.usuario.tipo !== 9 && req.usuario.id !== params.id){
        resp.errors.push({
            msg: "Você não tem permissão para editar esse usuário!"
        });
        return res.status(403).send(resp);
    }

    const usuarioGet = await Usuario.GetFirst(`id = '${params.id}'`);

    if (usuarioGet === null) {
        resp.errors.push({
            msg: 'Usuário não encontrado!'
        });
        return res.status(404).send(resp);
    }


    const data : { [k: string] : any} = {};
    const proibidos = ['id', 'status', 'tipo'];
    let edit = false;

    Usuario.fields.forEach(campo => {
        if (body[campo.name] !== undefined && !proibidos.includes(campo.name)) {
            data[campo.name] = body[campo.name];
            if (campo.name === 'nome') {
                data.nome_normalizado = Util.toNormal(body[campo.name]);
            }
            if (campo.name === 'senha') {
                data[campo.name] = Util.Encrypt(body[campo.name], params.id);
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

    if(body.cpf !== undefined){
        const cpfExiste = await Usuario.GetFirst(`cpf = '${body.cpf}'`);
        if(cpfExiste !== null){
            resp.errors.push({
                msg: "Já existe um usuário com esse cpf!"
            });
            return res.status(400).send(resp);
        }
    }

    const update = await Usuario.Update(data, `id = '${params.id}'`);

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

// [DELETE] => /usuario/:id
routes.delete('/usuario/:id', async (req, res) => {
    const { params } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    if(req.usuario.tipo !== 9 && req.usuario.id !== params.id){
        resp.errors.push({
            msg: "Você não tem permissão para excluir esse usuário!"
        });
        return res.status(403).send(resp);
    }

    const usuarioGet = <IUsuario> await Usuario.GetFirst(`id = '${params.id}'`);

    if (usuarioGet === null) {
        resp.errors.push({
            msg: 'Usuário não encontrado!'
        });
        return res.status(404).send(resp);
    }

    const del = await Usuario.Delete(`id = '${params.id}'`);

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
