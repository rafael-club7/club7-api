import { Router } from 'express';
import Usuario, { IUsuario } from '../classes/Usuario';
import Sessao from '../classes/Sessao';
import Util from '../System/Util';
import Mailer from '../System/Mailer';

const routes = Router();


// [GET] => /perfil
routes.get('/perfil', async (req, res) => {
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const usuario = <IUsuario> await Usuario.GetFirst(`id = '${req.usuario.id}'`);

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

// [PUT] => /perfil
routes.put('/perfil', async (req, res) => {
    const { body } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const usuarioGet = await Usuario.GetFirst(`id = '${req.usuario.id}'`);

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
                data[campo.name] = Util.Encrypt(body[campo.name], req.usuario.id);
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

    const update = await Usuario.Update(data, `id = '${req.usuario.id}'`);

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


export default routes;
