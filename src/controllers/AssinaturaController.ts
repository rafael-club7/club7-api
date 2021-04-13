import { Router } from 'express';
import Plano, { IPlano } from '../Classes/Plano';
import Assinatura, { IAssinatura, getFormasPagamentoName } from '../classes/Assinatura';
import Util from '../System/Util';
import Usuario from '../classes/Usuario';
import CartaoCredito, { ICartaoCredito } from '../classes/CartaoCredito';

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

    // TODO: Gerar Cobranca

    if(getFormasPagamentoName(body.tipo) === "BOLETO"){
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

    if(getFormasPagamentoName(body.tipo) === "CARTAO_CREDITO"){
        const cartao : ICartaoCredito = {
            id: Util.GUID(),
            numero: body.cartao.numero.replace(/\D/g, ''),
            nome: body.cartao.nome,
            mes: body.cartao.validade.split('/')[0],
            ano: body.cartao.validade.split('/')[1],
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


    resp.status = 1;
    resp.msg = 'Assinatura realizada com sucesso!';
    resp.data = payload;
    res.send(resp);
});

// [GET] => /assinatura
// [GET] => /assinatura/:id
// [PUT] => /assinatura/:id
// [DELETE] => /assinatura/:id


export default routes;
