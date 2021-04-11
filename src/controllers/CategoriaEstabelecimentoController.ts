import { Router } from 'express';
import Util from '../System/Util';
import CategoriaEstabelecimento, { ICategoriaEstabelecimento } from '../classes/CategoriaEstabelecimento';

const routes = Router();

// [POST] => /categoria-estabelecimento/:id
routes.post('/categoria-estabelecimento', async (req, res) => {
    const { body } = req;

    const resp = {
        data: null,
        status: 0,
        msg: '',
        errors: []
    };

    resp.errors = await CategoriaEstabelecimento.Validate(body);

    if (resp.errors.length > 0) {
        return res.status(400).send(resp);
    }

    const categorias = <ICategoriaEstabelecimento> await CategoriaEstabelecimento.GetFirst(`nome = '${body.nome}'`);

    if (categorias !== null) {
        resp.errors.push({
            param: 'nome',
            msg: 'Já existe um categoria com esse nome.'
        });

        return res.status(400).send(resp);
    }

    const categoria : ICategoriaEstabelecimento = {
        id: Util.GUID(),
        nome: body.nome,
        nome_normalizado: Util.toNormal(body.nome),
        status: 1
    };

    const create = await CategoriaEstabelecimento.Create(categoria);

    if (create.status !== 1) {
        resp.errors.push({
            msg: 'Erro ao criar categoria!'
        });
        return res.status(500).send(resp);
    }

    resp.status = create.status;
    resp.data = categoria;
    resp.msg = 'Criado com sucesso!';
    res.send(resp);
});

// [GET] => /categoria-estabelecimento
routes.get('/categoria-estabelecimento', async (req, res) => {
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

    const categorias = <ICategoriaEstabelecimento[]> await CategoriaEstabelecimento.Get(where, order_by, limit);

    res.set('X-TOTAL-COUNT', await CategoriaEstabelecimento.Count(where));

    resp.status = 1;
    resp.data = categorias;
    res.send(resp);
});

// [GET] => /categoria-estabelecimento/:id
routes.get('/categoria-estabelecimento/:id', async (req, res) => {
    const { params } = req;
    const resp = {
        status: 0,
        data: null,
        errors: []
    };

    const categoria = <ICategoriaEstabelecimento> await CategoriaEstabelecimento.GetFirst(`id = '${params.id}'`);

    if (categoria === null) {
        resp.errors.push({
            msg: 'Categoria não encontrada!'
        });
        return res.status(404).send(resp);
    }

    resp.status = 1;
    resp.data = categoria;
    res.send(resp);
});

// [PUT] => /categoria-estabelecimento/:id
routes.put('/categoria-estabelecimento/:id', async (req, res) => {
    const { params, body } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const categoriaGet = <ICategoriaEstabelecimento> await CategoriaEstabelecimento.GetFirst(`id = '${params.id}'`);

    if (categoriaGet === null) {
        resp.errors.push({
            msg: 'Categoria não encontrada!'
        });
        return res.status(404).send(resp);
    }

    const data : { [k: string] : any} = {};
    const proibidos = ['id', 'status'];
    let edit = false;

    CategoriaEstabelecimento.fields.forEach(campo => {
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

    if(body.nome !== undefined){
        const nomeExiste = await CategoriaEstabelecimento.GetFirst(`nome = '${body.nome}'`);
        if(nomeExiste !== null){
            resp.errors.push({
                msg: "Já existe uma categoria com esse nome!"
            });
            return res.status(400).send(resp);
        }
    }

    const update = await CategoriaEstabelecimento.Update(data, `id = '${params.id}'`);

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

// [DELETE] => /categoria-estabelecimento/:id

export default routes;
