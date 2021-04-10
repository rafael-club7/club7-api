import { Router } from 'express';
import Usuario, { IUsuario } from '../classes/Usuario';
import Sessao from '../classes/Sessao';
import Util from '../System/Util';
import Mailer from '../System/Mailer';

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

    if (resp.errors.length > 0) {
        return res.status(400).send(resp);
    }

    const payload = {
        id: Util.GUID(),
        ...body,
        cpf: body.cpf.toString().replace(/\D+/g, ''),
        nome_normalizado: Util.toNormal(body.nome),
        data_criacao: new Date().toJSON(),
    };

    payload.senha = Util.Encrypt(body.senha, payload.id);

    if (!Util.validaCpf(body.cpf)) {
        resp.errors.push({
            msg: "CPF inválido!"
        });
        return res.status(400).send(resp);
    }

    if (!['', null, undefined].includes(body.indicado)) {
        const indicacaoExiste = await Usuario.GetFirst(`id = '${body.indicado}'`);
        if (indicacaoExiste === null) {
            resp.errors.push({
                msg: "Usuário de indicação não encontrado"
            });
            return res.status(404).send(resp);
        }
    }

    const usuarioExiste = await Usuario.GetFirst(`cpf = '${payload.cpf}' OR email = '${payload.email}'`);
    if (usuarioExiste !== null) {
        if (usuarioExiste.email === payload.email) {
            resp.errors.push({
                msg: "Este email já está sendo utilizado"
            });
        }

        if (usuarioExiste.cpf === payload.cpf) {
            resp.errors.push({
                msg: "Este CPF já está sendo utilizado"
            });
        }

        if (resp.errors.length > 0) {
            return res.status(400).send(resp);
        }
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

// [POST] => /login
routes.post('/login', async (req, res) => {
    const { body } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const obrigatorios = ['email', 'senha'];

    for (const campo of obrigatorios) {
        if (['', undefined].includes(body[campo])) {
            resp.errors.push({
                msg: `O campo '${campo}' é obrigatório!`
            });
        }
    }

    if (resp.errors.length > 0) {
        return res.status(400).send(resp);
    }

    const usuario = <IUsuario>await Usuario.GetFirst(`email = '${body.email}'`);

    if (usuario === null) {
        resp.errors.push({
            msg: 'Usuário não existe'
        });

        return res.status(404).send(resp);
    }

    if (Util.Decrypt(usuario.senha, usuario.id) !== body.senha) {
        resp.errors.push({
            msg: 'Senha incorreta'
        });

        return res.status(400).send(resp);
    }

    const sessao = {
        id: Util.GUID(),
        usuario: usuario.id,
        data_inicio: new Date().toJSON(),
        ultima_data: new Date().toJSON()
    };

    const create = await Sessao.Create(sessao);

    if (create.status !== 1) {
        resp.errors.push({
            msg: 'Erro ao gerar sessao!'
        });
        return res.status(500).send(resp);
    }

    resp.status = 1;
    resp.msg = 'Login efetuado com sucesso';
    resp.data = sessao.id;

    res.send(resp);
});

// [POST] => /logout
routes.post('/logout', async (req, res) => {
    const { headers } = req;
    const resp = {
        status: 0,
        msg: '',
        errors: []
    };

    const sid = headers.authorization;

    const sessao = await Sessao.Verificar(sid);

    if (sessao.status !== 1) {
        resp.errors.push({
            msg: sessao.msg
        });

        return res.status(401).send(resp);
    }

    const del = await Sessao.Delete(`id = '${sid}'`);

    if (del.status !== 1) {
        resp.errors.push({
            msg: 'Erro ao fazer logout'
        });
        return res.status(500).send(resp);
    }

    resp.status = 1;
    resp.msg = 'Logout efetuado com sucesso';

    res.send(resp);
});

// [POST] => /usuario/senha
routes.post('/usuario/senha', async (req, res) => {
    const { body } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const obrigatorios = ['email', 'link'];

    for (const campo of obrigatorios) {
        if (['', undefined].includes(body[campo])) {
            resp.errors.push({
                msg: `O campo '${campo}' é obrigatório!`
            });
        }
    }

    if (resp.errors.length > 0) {
        return res.status(400).send(resp);
    }

    const usuario = await Usuario.GetFirst(`email = '${body.email}'`);
    if (usuario === null) {
        resp.errors.push({
            msg: "Email não encontrado!"
        });
        return res.status(404).send(resp);
    }

    const key = new Date().getTime() / 1000 | 0;
    const link = `${body.link}?id=${usuario.id}&key=${key}`;

    const mail = new Mailer();
    const modeloEmail = Mailer.SolicitarNovaSenha(link);
    mail.to = body.email;
    mail.subject = modeloEmail.titulo;
    mail.message = modeloEmail.email;

    // TODO: Criar Logs de tudo

    await mail.Send().catch(e => {
        resp.errors.push({
            msg: "Erro ao enviar o email"
        });
        console.error(e);
    });
    
    if(resp.errors.length > 0)
        return res.status(500).send(resp);
    
    Usuario.Update({ mudar_senha: key }, `id = '${usuario.id}'`);

    resp.status = 1;
    resp.msg = "Nova senha solicitada com sucesso!";
    res.send(resp);
});

// [PUT] => /usuario/senha
routes.put('/usuario/senha', async (req, res) => {
    const { body } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const obrigatorios = [ 'senha', 'id', 'key' ];

    for (const campo of obrigatorios) {
        if (['', undefined].includes(body[campo])) {
            resp.errors.push({
                msg: `O campo '${campo}' é obrigatório!`
            });
        }
    }

    if (resp.errors.length > 0) {
        return res.status(400).send(resp);
    }

    const usuario = await Usuario.GetFirst(`id = '${body.id}'`);

    if(usuario === null){
        resp.errors.push({
            msg: "Usuário não encontrado."
        });
        
        res.status(404).send(resp);
        return;
    }
    
    if(Number(usuario.mudar_senha) === 0 || usuario.mudar_senha !== Number(body.key)){
        resp.errors.push({
            msg: "Link inválido ou expirado: Solicite nova senha novamente!"
        });
        return res.status(401).send(resp);        
    }

    const data = { senha: Util.Encrypt(body.senha, usuario.id), mudar_senha: 0 };

    const atualizarSenha = await Usuario.Update(data, `id = '${usuario.id}'`);

    if(atualizarSenha.status !== 1){
        resp.errors.push({
            msg: "Erro ao alterar senha"
        });
        return res.status(500).send(resp);
    }
    
    resp.status = 1;
    resp.msg = "Senha atualizada com sucesso!";
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

    const usuarios = <IUsuario[]> await Usuario.Get(where, order_by, limit);

    res.set('X-TOTAL-COUNT', await Usuario.Count(where));

    resp.status = 1;
    resp.data = usuarios;
    res.send(resp);
});

export default routes;
