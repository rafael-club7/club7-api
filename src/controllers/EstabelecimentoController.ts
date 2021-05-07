import { Router } from 'express';
import Usuario, { IUsuario } from '../classes/Usuario';
import Estabelecimento, { IEstabelecimento } from '../classes/Estabelecimento';
import CategoriaEstabelecimento, { ICategoriaEstabelecimento } from '../classes/CategoriaEstabelecimento';
import Util from '../System/Util';

const routes = Router();

// [POST] => /estabelecimento
routes.post(`/estabelecimento`, async (req, res) => {
    const { body } = req;
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
    const coordenadas = await CepCoords.getByEndereco(`${body.estado}, ${body.rua} ${body.numero}, ${body.cep}`);

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

// [GET] => /estabelecimento/categoria/:id
routes.get(`/estabelecimento/categoria/:id`, async (req, res) => {
    const { params } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };
    
    const categoria =  <ICategoriaEstabelecimento>await CategoriaEstabelecimento.GetFirst(`id = '${params.id}'`);
    if (categoria === null) {
        resp.errors.push({
            msg: 'Categoria não encontrado!'
        });
        return res.status(404).send(resp);
    }

    const estabelecimentos = await Estabelecimento.GetByCategoria(params.id);  

    resp.status = 1;
    resp.data = estabelecimentos;
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

// [GET] => /estabelecimento
routes.get('/estabelecimento', async (req, res) => {
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

    const estabelecimentos = <IEstabelecimento[]> await Estabelecimento.Get(where, order_by, limit);

    for (const i in estabelecimentos) {
        const parceiro = <IUsuario> await Usuario.GetFirst(`id = '${estabelecimentos[i].parceiro}'`);
        estabelecimentos[i].nome = parceiro.nome;
        const categoria = <ICategoriaEstabelecimento> await CategoriaEstabelecimento.GetFirst(`id = '${parceiro.categoria}'`);
        estabelecimentos[i].categoria = categoria.nome;
    }

    res.set('X-TOTAL-COUNT', await Estabelecimento.Count(where));

    resp.status = 1;
    resp.data = estabelecimentos;
    res.send(resp);
});

// [PUT] => /estabelecimento/:id
routes.put(`/estabelecimento/:id`, async (req, res) => {
    const { body, params } = req;
    const resp = {
        status: 0,
        msg: '',
        data: null,
        errors: []
    };
    
    const estabelecimento = <IEstabelecimento>await Estabelecimento.GetFirst(`id = '${params.id}'`);
    if (estabelecimento === null) {
        resp.errors.push({
            msg: "Estabelecimento não encontrado"
        });
        return res.status(400).send(resp);
    }

    const payload : {[k: string] : any} = {};

    const data : { [k: string] : any} = {};
    const proibidos = ['id', 'latidude', 'longitude'];
    let edit = false;
    
    Estabelecimento.fields.forEach(campo => {
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

    if(body.rua || body.numero || body.bairro || body.cidade || body.estado || body.cep ){
        const CepCoords = require("coordenadas-do-cep");
        const coordenadas = await CepCoords.getByEndereco(`${body.estado || estabelecimento.estado}, ${body.rua || estabelecimento.rua} ${body.numero || estabelecimento.numero}, ${body.cep || estabelecimento.cep}`);
    
        const estabelecimentoExiste = <IEstabelecimento>await Estabelecimento.GetFirst(`latitude = '${coordenadas.lat}' AND longitude = '${coordenadas.lon}' and id != '${params.id}'`);
        if (estabelecimentoExiste !== null) {
            resp.errors.push({
                msg: "Voce já cadastrou um estabelecimento nessas coordenadas"
            });
            return res.status(400).send(resp);
        }

        payload.latitude = coordenadas.lat;
        payload.longitude = coordenadas.lon;
    }

    const create = await Estabelecimento.Update(payload, `id = '${params.id}'`);
    if (create.status !== 1) {
        resp.errors.push({
            msg: "Erro ao gravar no banco!"
        });
        return res.status(500).send(resp);
    }
    
    resp.status = 1;
    resp.msg = 'Estabelecimento atualizado com sucesso';
    res.send(resp);
});


export default routes;
