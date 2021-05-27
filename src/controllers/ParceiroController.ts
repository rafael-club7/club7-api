import { Router } from 'express';
import Usuario, { IUsuario } from '../classes/Usuario';
import CategoriaParceiro, { ICategoriaParceiro } from '../classes/CategoriaParceiro';
import Util from '../System/Util';

const routes = Router();

// [GET] => /parceiro/categoria/:id
routes.get(`/parceiro/categoria/:id`, async (req, res) => {
    const { params } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };
    
    const categoria =  <ICategoriaParceiro>await CategoriaParceiro.GetFirst(`id = '${params.id}'`);
    if (categoria === null) {
        resp.errors.push({
            msg: 'Categoria não encontrado!'
        });
        return res.status(404).send(resp);
    }

    resp.status = 1;
    resp.data = await Usuario.GetParceiroPorCategoria(params.id);
    res.send(resp);
});

// [GET] => /parceiro/:id
routes.get(`/parceiro/:id`, async (req, res) => {
    const { params } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };
    
    const parceiro = <IUsuario>await Usuario.GetFirst(`id = '${params.id}' and tipo = 2`);
    
    if (parceiro === null) {
        resp.errors.push({
            msg: 'Parceiro não encontrado!'
        });
        return res.status(404).send(resp);
    }
    
    resp.status = 1;
    resp.data = parceiro;
    res.send(resp);
});

// [GET] => /parceiro
routes.get('/parceiro', async (req, res) => {
    const { query } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    let where = (query.where) ? Util.utf8Decode(unescape(String(query.where))) : '';
    const order_by = String((query.order_by) ? query.order_by : '');
    const limit = String((query.limit) ? query.limit : '');
    where = where === '' ? 'tipo = 2' : `(${where}) AND tipo = 2`;

    const parceiros = <IUsuario[]> await Usuario.Get(where, order_by, limit);

    for (const i in parceiros) {
        const categoria = <ICategoriaParceiro> await CategoriaParceiro.GetFirst(`id = '${parceiros[i].categoria}'`);
        parceiros[i].categoria = categoria.nome;
    }

    res.set('X-TOTAL-COUNT', await Usuario.Count(where));

    resp.status = 1;
    resp.data = parceiros;
    res.send(resp);
});

export default routes;
