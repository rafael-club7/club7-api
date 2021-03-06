import { Router } from 'express';
import Mailer from '../System/Mailer';
import Usuario, { IUsuario } from '../classes/Usuario';
import Util from '../System/Util';
import CategoriaParceiro from '../classes/CategoriaParceiro';

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

    if (resp.errors.length > 0)
        return res.status(400).send(resp);

    const payload: IUsuario = {
        id: Util.GUID(),
        nome: body.nome,
        nome_normalizado: Util.toNormal(body.nome),
        email: body.email,
        senha: body.senha,
        celular: body.celular,
        cpf: body.cpf,
        cnpj: body.cnpj,
        descricao: body.descricao,
        categoria: body.categoria,
        data_criacao: new Date().toJSON(),
        tipo: body.tipo,
        status: 0
    };

    payload.senha = Util.Encrypt(body.senha, payload.id);

    if (!['', null, undefined].includes(body.indicado)) {
        const indicacaoExiste = await Usuario.GetFirst(`id = '${body.indicado}'`);
        if (indicacaoExiste === null) {
            resp.errors.push({
                msg: "Usuário de indicação não encontrado"
            });
            return res.status(404).send(resp);
        }
        payload.indicado = body.indicado;
    }

    const usuarioExiste = await Usuario.GetFirst(`email = '${payload.email}' OR celular = '${payload.celular}' ${payload.tipo === 1 ? `OR cpf = '${payload.cpf}'` : ''} ${payload.tipo === 2 ? `OR cnpj = '${payload.cnpj}'` : ''}`);
    if (usuarioExiste !== null) {
        if (usuarioExiste.email === payload.email) {
            resp.errors.push({
                msg: "Este email já está sendo utilizado"
            });
        }

        if (usuarioExiste.celular === payload.celular) {
            resp.errors.push({
                msg: "Este celular já está sendo utilizado"
            });
        }

        if (payload.tipo === 1) {
            if (usuarioExiste.cpf === payload.cpf) {
                resp.errors.push({
                    msg: "Este CPF já está sendo utilizado"
                });
            }
        }

        if (payload.tipo === 2) {
            if (usuarioExiste.cnpj === payload.cnpj) {
                resp.errors.push({
                    msg: "Este CNPJ já está sendo utilizado"
                });
            }
        }

        if (resp.errors.length > 0) {
            return res.status(400).send(resp);
        }
    }

    const link = `${req.get('origin')}/${body.url}?user=${payload.id}`;

    const mailSent = (payload.tipo === 1) ?
        await Mailer.EnviarEmailCadastroUsuario(payload, link) :
        await Mailer.EnviarEmailCadastroParceiro(payload, link);

    if (!mailSent) {
        resp.errors.push({
            msg: "Erro ao enviar o email"
        });
        return res.status(500).send(resp);
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

    const usuarios = <IUsuario[]>await Usuario.Get(where, order_by, limit);

    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].categoria !== null) {
            usuarios[i].categoria = (await CategoriaParceiro.GetFirst(`id = '${usuarios[i].categoria}'`)).nome;
        }

    }

    res.set('X-TOTAL-COUNT', await Usuario.Count(where));

    resp.status = 1;
    resp.data = usuarios;
    res.send(resp);
});

// [GET] => /usuario/perfil
routes.get('/usuario/perfil', async (req, res) => {
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const usuario = <IUsuario>await Usuario.GetFirst(`id = '${req.usuario.id}'`);

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

// [GET] => /usuario/:id
routes.get('/usuario/:id', async (req, res) => {
    const { params } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    if (req.usuario.tipo !== 9 && req.usuario.id !== params.id) {
        resp.errors.push({
            msg: "Você não tem permissão para visualizar esse usuário!"
        });
        return res.status(403).send(resp);
    }

    const usuario = <IUsuario>await Usuario.GetFirst(`id = '${params.id}'`);

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
    const { params, body, files } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    if (req.usuario.tipo !== 9 && req.usuario.id !== params.id) {
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

    const data: { [k: string]: any } = {};
    const proibidos = ['id', 'status', 'tipo'];
    let edit = false;

    Usuario.fields.forEach(campo => {
        if (body[campo.name] !== undefined && !proibidos.includes(campo.name) && usuarioGet[campo.name] !== body[campo.name] ) {
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

    if (files && files.imagem) {
        const dir = `${__dirname.replace("\\src\\controllers", "")}\\media`;

        const fs = require('fs');
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);

        data.imagem = `${(new Date()).getTime()}_${files.imagem.name}`;
        files.imagem.mv(`${dir}\\${data.imagem}`);
        edit = true;
    }

    if (!edit) {
        resp.errors.push({
            msg: 'Nada para editar'
        });
        return res.status(400).send(resp);
    }

    if (body.cpf !== undefined) {
        const cpfExiste = await Usuario.GetFirst(`cpf = '${body.cpf}' and id != '${params.id}'`);
        if (cpfExiste !== null) {
            resp.errors.push({
                msg: "Já existe um usuário com esse cpf!"
            });
            return res.status(400).send(resp);
        }
    }

    if (body.cnpj !== undefined) {
        const cnpjExiste = await Usuario.GetFirst(`cnpj = '${body.cnpj}' and id != '${params.id}'`);
        if (cnpjExiste !== null) {
            resp.errors.push({
                msg: "Já existe um usuário com esse cnpj!"
            });
            return res.status(400).send(resp);
        }
    }

    if (body.rua || body.numero || body.bairro || body.cidade || body.estado || body.cep) {
        try {
            const CepCoords = require("coordenadas-do-cep");
            const coordenadas = await CepCoords.getByEndereco(`${body.cidade || usuarioGet.cidade}, ${body.rua || usuarioGet.rua} ${body.numero || usuarioGet.numero}, ${body.cep.replace(/\D/g, '') || usuarioGet.cep.replace(/\D/g, '')}`);
            data.latitude = coordenadas.lat;
            data.longitude = coordenadas.lon;
        } catch (e) {
            console.log(`Erro ao buscar coordenadas: ${e}`);
            resp.errors.push({
                msg: 'Erro ao buscar coordenadas do local!'
            });

            return res.status(500).send(resp);
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

    if (req.usuario.tipo !== 9 && req.usuario.id !== params.id) {
        resp.errors.push({
            msg: "Você não tem permissão para excluir esse usuário!"
        });
        return res.status(403).send(resp);
    }

    const usuarioGet = <IUsuario>await Usuario.GetFirst(`id = '${params.id}'`);

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
