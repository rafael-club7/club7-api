import { Router } from 'express';
import Plano, { IPlano } from '../classes/Plano';
import Assinatura, { IAssinatura, getFormasPagamentoName } from '../classes/Assinatura';
import Util from '../System/Util';
import Usuario, { IUsuario } from '../classes/Usuario';
import CartaoCredito, { ICartaoCredito } from '../classes/CartaoCredito';
import Mailer from '../System/Mailer';

const routes = Router();


// [POST] => /assinatura
routes.post(`/assinatura`, async (req, res) => {
    const { body } = req;

    const resp = {
        status: 0,
        data: null,
        errors: [],
        msg: ''
    };

    resp.errors = await Assinatura.Validate(body);

    if (resp.errors.length > 0)
        return res.status(400).send(resp);

    const possuiAssinatura = await Assinatura.GetFirst(`usuario = '${req.usuario.id}'`);
    if(possuiAssinatura !== null){
        resp.errors.push({
            msg: "Esse usuário já possui assinatura!"
        });
        return res.status(400).send(resp);
    }
    
    const plano = <IPlano> await Plano.GetFirst(`id = '${body.plano}'`);
    if(plano === null){
        resp.errors.push({
            msg: "Plano não encontrado!"
        });
        return res.status(404).send(resp);
    }

    const payload : IAssinatura = {
        id: Util.GUID(),
        usuario: req.usuario.id,
        plano: plano.id,
        valor: parseFloat(plano.valor.toString()),
        forma_pagamento: body.forma_pagamento,
        data_inicio: new Date().toJSON(),
        status: 1
    };

    // TODO: [CLUB7-86] [API][SERVICO] - Gerar Cobranca

    if(getFormasPagamentoName(body.forma_pagamento) === "BOLETO"){
        const endereco = {
            rua: body.endereco.rua,
            cep: body.endereco.cep.replace(/\D/g, ''),
            numero: body.endereco.numero,
            complemento: body.endereco.complemento,
            bairro: body.endereco.bairro,
            cidade: body.endereco.cidade,
            estado: body.endereco.estado
        };
        
        const atualizaEndereco = await Usuario.Update(endereco, `id = '${req.usuario.id}'`);
        if(atualizaEndereco.status !== 1){
            resp.errors.push({
                msg: "Erro ao guardar endereço"
            });
            return res.status(500).send(resp);
        }
    }

    if(getFormasPagamentoName(body.forma_pagamento) === "CARTAO_CREDITO"){
        const cartao : ICartaoCredito = {
            id: Util.GUID(),
            numero: body.cartao.numero.replace(/\D/g, ''),
            nome: body.cartao.nome,
            mes: body.cartao.vencimento.split('/')[0],
            ano: body.cartao.vencimento.split('/')[1],
            cvv: body.cartao.cvv,
            usuario: req.usuario.id,
            status: 1
        };

        const cartaoExiste = await CartaoCredito.GetFirst(`numero = '${cartao.numero}' AND usuario = '${req.usuario.id}'`);
        if(cartaoExiste === null){
            const createCartao = await CartaoCredito.Create(cartao);
            if(createCartao.status !== 1){
                resp.errors.push({
                    msg: "Erro ao registrar cartão"
                });
                return res.status(500).send(resp);
            }
        }
        
        payload.cartao = cartaoExiste !== null ? cartaoExiste.id : cartao.id;
    }

    const create = await Assinatura.Create(payload);
    if(create.status !== 1){
        resp.errors.push({
            msg: "Erro ao registrar assinatura"
        });
        res.status(500).send(resp);
    }

    const mailSent = body.tipo_pagamento === 1 ? await Mailer.EnviarEmailConfirmacaoAssinaturaCartao(<IUsuario>req.usuario) : await Mailer.EnviarEmailConfirmacaoAssinaturaBoleto(<IUsuario>req.usuario);

    if(!mailSent){
        resp.errors.push({
            msg: "Erro ao enviar o email"
        });
        return res.status(500).send(resp);
    }
    
    resp.status = 1;
    resp.msg = 'Assinatura realizada com sucesso!';
    resp.data = payload;
    res.send(resp);
});

// [GET] => /assinatura
routes.get(`/assinatura`, async (req, res) => {
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

    const assinaturas = <IAssinatura[]> await Assinatura.Get(where, order_by, limit);

    res.set('X-TOTAL-COUNT', await Assinatura.Count(where));

    resp.status = 1;
    resp.data = assinaturas;
    res.send(resp);
});

//TODO: [CLUB7-90] Adicionar endpoint de verificar a minha assinatura
// [GET] => /assinatura/:id
routes.get('/assinatura/:id', async (req, res) => {
    const { params } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const assinatura = <IAssinatura> await Assinatura.GetFirst(`id = '${params.id}'`);
    
    if (assinatura === null) {
        resp.errors.push({
            msg: 'Assinatura não encontrada!'
        });
        return res.status(404).send(resp);
    }
    
    if(req.usuario.tipo !== 9 && req.usuario.id !== assinatura.usuario){
        resp.errors.push({
            msg: "Você não tem permissão para visualizar esse usuário!"
        });
        return res.status(403).send(resp);
    }

    resp.status = 1;
    resp.data = assinatura;
    res.send(resp);
});

// [PUT] => /assinatura/:id
routes.put('/assinatura/:id', async (req, res) => {
    const { params, body } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const assinaturaGet = <IAssinatura> await Assinatura.GetFirst(`id = '${params.id}'`);
    
    if (assinaturaGet === null) {
        resp.errors.push({
            msg: 'Assinatura não encontrada!'
        });
        return res.status(404).send(resp);
    }

    if(req.usuario.tipo !== 9 && req.usuario.id !== assinaturaGet.usuario){
        resp.errors.push({
            msg: "Você não tem permissão para editar esse usuário!"
        });
        return res.status(403).send(resp);
    }

    const data : { [k: string] : any} = {};
    
    const proibidos = ['id', 'usuario', 'data_inicio'];
    let edit = false;
    
    Assinatura.fields.forEach(campo => {
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

    const update = await Assinatura.Update(data, `id = '${params.id}'`);

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

// [DELETE] => /assinatura/:id
routes.delete('/assinatura/:id', async (req, res) => {
    const { params } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };

    const assinaturaGet = <IAssinatura> await Assinatura.GetFirst(`id = '${params.id}'`);

    if (assinaturaGet === null) {
        resp.errors.push({
            msg: 'Assinatura não encontrada!'
        });
        return res.status(404).send(resp);
    }

    if(req.usuario.tipo !== 9 && req.usuario.id !== assinaturaGet.usuario){
        resp.errors.push({
            msg: "Você não tem permissão para excluir esse registro!"
        });
        return res.status(403).send(resp);
    }

    const del = await Assinatura.Delete(`id = '${params.id}'`);

    if (del.status !== 1) {
        resp.errors.push({
            msg: 'Não foi possivel excluir'
        });

        return res.status(500).send(resp);
    }

    resp.status = 1;
    resp.msg = 'Excluida com sucesso';
    res.send(resp);
});


export default routes;
