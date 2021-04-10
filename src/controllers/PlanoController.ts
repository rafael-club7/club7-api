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
// [GET] => /plano/:id
// [PUT] => /plano/:id
// [DELETE] => /plano/:id


export default routes;
