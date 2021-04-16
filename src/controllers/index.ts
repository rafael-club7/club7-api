import { Router } from 'express';

import AutorizacaoController from './AutorizacaoController';
import UsuarioController from './UsuarioController';
import SessaoController from './SessaoController';
import PlanoController from './PlanoController';
import CategoriaEstabelecimentoController from './CategoriaEstabelecimentoController';
import AssinaturaController from './AssinaturaController';
import ServicoController from './ServicoController';
import DetalheEstabelecimento from './DetalheEstabelecimento';

const routes = Router();

[ 
    UsuarioController, 
    SessaoController, 
    AutorizacaoController, 
    PlanoController, 
    CategoriaEstabelecimentoController,
    AssinaturaController,
    ServicoController,
    DetalheEstabelecimento
].forEach((route) => {
    routes.stack = [...routes.stack, ...route.stack];
});

export default routes;
