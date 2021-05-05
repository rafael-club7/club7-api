import { Router } from 'express';
import Usuario, { IUsuario } from '../classes/Usuario';
import Sessao from '../classes/Sessao';
import Util from '../System/Util';
import Mailer from '../System/Mailer';

const routes = Router();

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

    if(usuario.status === 0){
        resp.errors.push({
            msg: "Esse usuário ainda não está ativo!"
        });
        return res.status(403).send(resp);
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

// [POST] => /nova-senha
routes.post('/nova-senha', async (req, res) => {
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

    const usuario = <IUsuario>await Usuario.GetFirst(`email = '${body.email}'`);
    if (usuario === null) {
        resp.errors.push({
            msg: "Email não encontrado!"
        });
        return res.status(404).send(resp);
    }

    const key = new Date().getTime() / 1000 | 0;
    const link = `${body.link}?id=${usuario.id}&key=${key}`;

    const mailSent = await Mailer.EnviarEmailSolicitarNovaSenha(usuario, link);

    if(!mailSent){
        resp.errors.push({
            msg: "Erro ao enviar o email"
        });
        return res.status(500).send(resp);
    }
    
    Usuario.Update({ mudar_senha: key }, `id = '${usuario.id}'`);

    resp.status = 1;
    resp.msg = "Nova senha solicitada com sucesso!";
    res.send(resp);
});

// [PUT] => /nova-senha
routes.put('/nova-senha', async (req, res) => {
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

// [POST] => /confirmar-email
routes.post(`/confirmar-email`, async (req, res) => {
    const { body } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const obrigatorios = [ 'id' ];

    for (const campo of obrigatorios) {
        if (['', undefined].includes(body[campo])) {
            resp.errors.push({
                msg: `O campo '${campo}' é obrigatório!`
            });
        }
    }

    if (resp.errors.length > 0) 
        return res.status(400).send(resp);

    const usuario = <IUsuario> await Usuario.GetFirst(`id = '${body.id}'`);
    if(usuario === null){
        resp.errors.push({
            msg: "Usuário não encontrado"
        });
        return res.status(404).send(resp);
    }

    if(usuario.confirmacao_email !== 0){
        resp.errors.push({
            msg: "O email desse usuário já foi confirmado!"
        });
        return res.status(400).send(resp);
    }

    Usuario.Update({ confirmacao_email: new Date().getTime() / 1000 | 0 }, `id = '${usuario.id}'`);

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
    resp.msg = 'Email confirmado com sucesso';
    resp.data = sessao.id;
    res.send(resp);
});

export default routes;
