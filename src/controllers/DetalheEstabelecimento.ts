import { Router } from 'express';
import Usuario, { IUsuario } from '../classes/Usuario';
import DetalhesEstabelecimento, { IDetalhesEstabelecimento } from '../classes/DetalhesEstabelecimento';
import Util from '../System/Util';

const routes = Router();

// [PUT] => /detalhe-estabelecimento/:estabelecimento
routes.put(`/detalhe-estabelecimento/:estabelecimento`, async (req, res) => {
    const { params, body } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };
    
    const estabelecimento = <IUsuario>await Usuario.GetFirst(`id = '${params.estabelecimento}' and tipo = 2`);
    
    if (estabelecimento === null) {
        resp.errors.push({
            msg: 'Estabelecimento não encontrado!'
        });
        return res.status(404).send(resp);
    }
    
    if(req.usuario.tipo !== 9 && req.usuario.id !== params.estabelecimento){
        resp.errors.push({
            msg: "Você não tem permissão para editar esse estabelecimento!"
        });
        return res.status(403).send(resp);
    }

    resp.errors = await DetalhesEstabelecimento.Validate(body);

    if (resp.errors.length > 0)
        return res.status(400).send(resp);

    const detalhes = <IDetalhesEstabelecimento>await DetalhesEstabelecimento.GetFirst(`estabelecimento = '${params.estabelecimento}'`);
    if (detalhes === null) {
        const payload: IDetalhesEstabelecimento = {
            id: Util.GUID(),
            estabelecimento: params.estabelecimento,
            tem_banheiro: body.tem_banheiro,
            tem_local_carregar_celular: body.tem_local_carregar_celular,
            tem_local_descanso: body.tem_local_descanso,
            tem_wifi: body.tem_wifi,
            wifi_nome: body.wifi_nome,
            wifi_senha: body.wifi_senha
        };

        const create = await DetalhesEstabelecimento.Create(payload);
        if (create.status !== 1) {
            resp.errors.push({
                msg: "Erro ao gravar no banco!"
            });
            return res.status(500).send(resp);
        }
    } else {
        const data: { [k: string]: any } = {};

        const proibidos = ['id', 'estabelecimento'];
        let edit = false;

        DetalhesEstabelecimento.fields.forEach(campo => {
            if (body[campo.name] !== undefined && !proibidos.includes(campo.name)) {
                data[campo.name] = body[campo.name];
                edit = true;
            }
        });

        if (!edit) {
            resp.errors.push({
                msg: 'Nada para editar'
            });
            return res.status(400).send(resp);
        }

        const update = await DetalhesEstabelecimento.Update(data, `estabelecimento = '${params.estabelecimento}'`);

        if (update.status !== 1) {
            resp.errors.push({
                msg: 'Não foi possivel atualizar'
            });

            return res.status(500).send(resp);
        }
    }

    resp.status = 1;
    resp.msg = 'Atualizado com sucesso';
    res.send(resp);
});

// [GET] => /detalhe-estabelecimento/:estabelecimento
routes.get(`/detalhe-estabelecimento/:estabelecimento`, async (req, res) => {
    const { params } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };
    
    const estabelecimento = <IUsuario>await Usuario.GetFirst(`id = '${params.estabelecimento}' and tipo = 2`);
    
    if (estabelecimento === null) {
        resp.errors.push({
            msg: 'Estabelecimento não encontrado!'
        });
        return res.status(404).send(resp);
    }
    
    const detalhes = <IDetalhesEstabelecimento>await DetalhesEstabelecimento.GetFirst(`estabelecimento = '${params.estabelecimento}'`);

    resp.status = 1;
    resp.msg = 'Atualizado com sucesso';
    resp.data = detalhes;
    res.send(resp);
});

export default routes;
