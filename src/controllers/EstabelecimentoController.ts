import { Router } from 'express';
import Usuario, { IUsuario } from '../classes/Usuario';
import Estabelecimento, { IEstabelecimento } from '../classes/Estabelecimento';
import Util from '../System/Util';

const routes = Router();

// [POST] => /estabelecimento
routes.post(`/estabelecimento`, async (req, res) => {
    const { params, body } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };
    
    resp.errors = await Estabelecimento.Validate(body);

    if (resp.errors.length > 0)
        return res.status(400).send(resp);

    const parceiro = <IUsuario>await Usuario.GetFirst(`id = '${req.usuario.id}' and tipo = 2`);
    
    if (parceiro === null) {
        resp.errors.push({
            msg: 'Parceiro não encontrado!'
        });
        return res.status(404).send(resp);
    }

    const CepCoords = require("coordenadas-do-cep");
    const coordenadas = await CepCoords.getByEndereco(`${body.estado}, ${body.rua} ${body.numero}`);

    const estabelecimentoExiste = <IEstabelecimento>await Estabelecimento.GetFirst(`latitude = '${coordenadas.lat}' AND longitude = '${coordenadas.lon}'`);
    if (estabelecimentoExiste !== null) {
        resp.errors.push({
            msg: "Voce já cadastrou um estabelecimento nessas coordenadas"
        });
        return res.status(400).send(resp);
    }
        
    const payload: IEstabelecimento = {
        id: Util.GUID(),
        parceiro: req.usuario.id,
        tem_banheiro: body.tem_banheiro,
        tem_local_carregar_celular: body.tem_local_carregar_celular,
        tem_local_descanso: body.tem_local_descanso,
        tem_wifi: body.tem_wifi,
        wifi_nome: body.wifi_nome,
        wifi_senha: body.wifi_senha,
        rua: body.rua,
        numero: body.numero,
        cep: body.cep,
        bairro: body.bairro,
        cidade: body.cidade,
        estado: body.estado,
        complemento: body.complemento,
        latitude: coordenadas.lat,
        longitude: coordenadas.lon,
    };

    const create = await Estabelecimento.Create(payload);
    if (create.status !== 1) {
        resp.errors.push({
            msg: "Erro ao gravar no banco!"
        });
        return res.status(500).send(resp);
    }
    
    resp.status = 1;
    resp.msg = 'Estabelecimento cadastrado com sucesso';
    res.send(resp);
});

// [GET] => /estabelecimento/:id
routes.get(`/estabelecimento/:id`, async (req, res) => {
    const { params } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };
    
    const estabelecimento = <IEstabelecimento>await Estabelecimento.GetFirst(`id = '${params.id}'`);
    
    if (estabelecimento === null) {
        resp.errors.push({
            msg: 'Estabelecimento não encontrado!'
        });
        return res.status(404).send(resp);
    }
    
    const parceiro = <IUsuario>await Usuario.GetFirst(`parceiro = '${params.parceiro}'`);

    resp.status = 1;
    resp.data = {
        nome: parceiro.nome,
        cnpj: parceiro.cnpj,
        imagem: parceiro.imagem,
        ...estabelecimento
    };
    res.send(resp);
});

export default routes;
