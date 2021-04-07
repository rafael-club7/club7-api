import { Router } from 'express';
import Usuario, { IUsuario } from '../classes/Usuario';
import Sessao from '../classes/Sessao';
import Util from '../System/Util';

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
    
    if(!Util.validaCpf(body.cpf)){
        resp.errors.push({
            msg: "CPF inválido!"
        });
        return res.status(400).send(resp);
    }
    
    if(!['', null, undefined].includes(body.indicado)){
        const indicacaoExiste = await Usuario.GetFirst(`id = '${body.indicado}'`);
        if(indicacaoExiste === null){
            resp.errors.push({
                msg: "Usuário de indicação não encontrado"
            });
            return res.status(404).send(resp);
        }
    }

    const usuarioExiste = await Usuario.GetFirst(`cpf = '${payload.cpf}' OR email = '${payload.email}'`);
    if(usuarioExiste !== null){
        if(usuarioExiste.email === payload.email){
            resp.errors.push({
                msg: "Este email já está sendo utilizado"
            });
        }
        
        if(usuarioExiste.cpf === payload.cpf){
            resp.errors.push({
                msg: "Este CPF já está sendo utilizado"
            });
        }

        if (resp.errors.length > 0) {
            return res.status(400).send(resp);
        }
    }

    const create = await Usuario.Create(payload);
    if(create.status !== 1){
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

    const usuario = <IUsuario> await Usuario.GetFirst(`email = '${body.email}'`);

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


export default routes;
