import { Router } from 'express';
import Plano, { IPlano } from '../Classes/Plano';
import Util from '../System/Util';

const routes = Router();


// [POST] => /plano
routes.post('/plano', async (req, res) => {
    const { body } = req;

    const resp = {
        data: null,
        status: 0,
        msg: '',
        errors: []
    };

    resp.errors = await Plano.Validate(body);

    if (resp.errors.length > 0) {
        return res.status(400).send(resp);
    }

    const planos = <IPlano> await Plano.GetFirst(`nome = '${body.nome}'`);

    if (planos !== null) {
        resp.errors.push({
            param: 'nome',
            msg: 'Já existe um plano com esse nome.'
        });

        return res.status(400).send(resp);
    }

    const plano : IPlano = {
        id: Util.GUID(),
        nome: body.nome,
        nome_normalizado: Util.toNormal(body.nome),
        valor: parseFloat(body.valor).toFixed(2),
        status: 1
    };

    const create = await Plano.Create(plano);

    if (create.status !== 1) {
        resp.errors.push({
            msg: 'Erro ao criar plano!'
        });
        return res.status(500).send(resp);
    }

    resp.status = create.status;
    resp.data = plano;
    resp.msg = 'Criado com sucesso!';
    res.send(resp);
});

// [GET] => /plano
routes.get('/plano', async (req, res) => {
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

    const planos = <IPlano[]> await Plano.Get(where, order_by, limit);

    res.set('X-TOTAL-COUNT', await Plano.Count(where));

    resp.status = 1;
    resp.data = planos;
    res.send(resp);
});

// [GET] => /plano/:id
routes.get('/plano/:id', async (req, res) => {
    const { params } = req;
    const resp = {
        status: 0,
        data: null,
        errors: []
    };

    const plano = <IPlano> await Plano.GetFirst(`id = '${params.id}'`);

    if (plano === null) {
        resp.errors.push({
            msg: 'Plano não encontrado!'
        });
        return res.status(404).send(resp);
    }

    resp.status = 1;
    resp.data = plano;
    res.send(resp);
});

// [PUT] => /plano/:id
routes.put('/plano/:id', async (req, res) => {
    const { params, body } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const planoGet = <IPlano> await Plano.GetFirst(`id = '${params.id}'`);

    if (planoGet === null) {
        resp.errors.push({
            msg: 'Plano não encontrado!'
        });
        return res.status(404).send(resp);
    }

    const data : { [k: string] : any} = {};
    const proibidos = ['id', 'status'];
    let edit = false;

    Plano.fields.forEach(campo => {
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

    const update = await Plano.Update(data, `id = '${params.id}'`);

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

// [DELETE] => /plano/:id


export default routes;
