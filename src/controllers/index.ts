import { Router } from 'express';

import AutorizacaoController from './AutorizacaoController';
import UsuarioController from './UsuarioController';
import SessaoController from './SessaoController';
import PlanoController from './PlanoController';

const routes = Router();

[ UsuarioController, SessaoController, AutorizacaoController, PlanoController ].forEach((route) => {
    routes.stack = [...routes.stack, ...route.stack];
});

export default routes;
