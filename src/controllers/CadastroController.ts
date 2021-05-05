import { Router } from 'express';
import Mailer from '../System/Mailer';
import Usuario, { IUsuario } from '../classes/Usuario';
import Util from '../System/Util';

const routes = Router();


routes.post(`/cadastro-basico`, async (req, res) => {
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
        cpf: body.cpf,
        cnpj: body.cnpj,
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

    const usuarioExiste = await Usuario.GetFirst(`email = '${payload.email}'`);
    if (usuarioExiste !== null) {
        if (usuarioExiste.email === payload.email) {
            resp.errors.push({
                msg: "Este email já está sendo utilizado"
            });
        }

        if (resp.errors.length > 0) {
            return res.status(400).send(resp);
        }
    }

    const link = `${process.env.APP_URL}/confirmar-email?user=${payload.id}`;

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



export default routes;
