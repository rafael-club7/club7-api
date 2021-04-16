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
        estabelecimento: req.usuario.id,
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
// [GET] => /servico/:id
// [PUT] => /servico/:id
// [DELETE] => /servico/:id


export default routes;
