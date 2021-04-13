import { Router } from 'express';

import AutorizacaoController from './AutorizacaoController';
import UsuarioController from './UsuarioController';
import SessaoController from './SessaoController';
import PlanoController from './PlanoController';
import CategoriaEstabelecimentoController from './CategoriaEstabelecimentoController';
import AssinaturaController from './AssinaturaController';

const routes = Router();

[ 
    UsuarioController, 
    SessaoController, 
    AutorizacaoController, 
    PlanoController, 
    CategoriaEstabelecimentoController,
    AssinaturaController
].forEach((route) => {
    routes.stack = [...routes.stack, ...route.stack];
});

export default routes;
