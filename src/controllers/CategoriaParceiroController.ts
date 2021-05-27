import { Router } from 'express';
import Util from '../System/Util';
import CategoriaParceiro, { ICategoriaParceiro } from '../classes/CategoriaParceiro';

const routes = Router();

// [POST] => /categoria-parceiro/:id
routes.post('/categoria-parceiro', async (req, res) => {
    const { body } = req;

    const resp = {
        data: null,
        status: 0,
        msg: '',
        errors: []
    };

    resp.errors = await CategoriaParceiro.Validate(body);

    if (resp.errors.length > 0) {
        return res.status(400).send(resp);
    }

    const categorias = <ICategoriaParceiro> await CategoriaParceiro.GetFirst(`nome = '${body.nome}'`);

    if (categorias !== null) {
        resp.errors.push({
            param: 'nome',
            msg: 'Já existe um categoria com esse nome.'
        });

        return res.status(400).send(resp);
    }

    const categoria : ICategoriaParceiro = {
        id: Util.GUID(),
        nome: body.nome,
        nome_normalizado: Util.toNormal(body.nome),
        status: 1
    };

    const create = await CategoriaParceiro.Create(categoria);

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

// [GET] => /categoria-parceiro
routes.get('/categoria-parceiro', async (req, res) => {
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

    const categorias = <ICategoriaParceiro[]> await CategoriaParceiro.Get(where, order_by, limit);

    res.set('X-TOTAL-COUNT', await CategoriaParceiro.Count(where));

    resp.status = 1;
    resp.data = categorias;
    res.send(resp);
});

// [GET] => /categoria-parceiro/:id
routes.get('/categoria-parceiro/:id', async (req, res) => {
    const { params } = req;
    const resp = {
        status: 0,
        data: null,
        errors: []
    };

    const categoria = <ICategoriaParceiro> await CategoriaParceiro.GetFirst(`id = '${params.id}'`);

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

// [PUT] => /categoria-parceiro/:id
routes.put('/categoria-parceiro/:id', async (req, res) => {
    const { params, body } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const categoriaGet = <ICategoriaParceiro> await CategoriaParceiro.GetFirst(`id = '${params.id}'`);

    if (categoriaGet === null) {
        resp.errors.push({
            msg: 'Categoria não encontrada!'
        });
        return res.status(404).send(resp);
    }

    const data : { [k: string] : any} = {};
    const proibidos = ['id', 'status'];
    let edit = false;

    CategoriaParceiro.fields.forEach(campo => {
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
        const nomeExiste = await CategoriaParceiro.GetFirst(`nome = '${body.nome}'`);
        if(nomeExiste !== null){
            resp.errors.push({
                msg: "Já existe uma categoria com esse nome!"
            });
            return res.status(400).send(resp);
        }
    }

    const update = await CategoriaParceiro.Update(data, `id = '${params.id}'`);

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

// [DELETE] => /categoria-parceiro/:id
routes.delete('/categoria-parceiro/:id', async (req, res) => {
    const { params } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const planoGet = <ICategoriaParceiro> await CategoriaParceiro.GetFirst(`id = '${params.id}'`);

    if (planoGet === null) {
        resp.errors.push({
            msg: 'Categoria de Parceiro não encontrada!'
        });
        return res.status(404).send(resp);
    }

    const del = await CategoriaParceiro.Delete(`id = '${params.id}'`);

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
