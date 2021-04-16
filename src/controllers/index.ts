import { Router } from 'express';

import AutorizacaoController from './AutorizacaoController';
import UsuarioController from './UsuarioController';
import SessaoController from './SessaoController';
import PlanoController from './PlanoController';
import CategoriaEstabelecimentoController from './CategoriaEstabelecimentoController';
import AssinaturaController from './AssinaturaController';
import ServicoController from './ServicoController';
import DetalheEstabelecimento from './DetalheEstabelecimento';
import IndicacaoController from './IndicacaoController';

const routes = Router();

[ 
    UsuarioController, 
    SessaoController, 
    AutorizacaoController, 
    PlanoController, 
    CategoriaEstabelecimentoController,
    AssinaturaController,
    ServicoController,
    DetalheEstabelecimento,
    IndicacaoController
].forEach((route) => {
    routes.stack = [...routes.stack, ...route.stack];
});

export default routes;
