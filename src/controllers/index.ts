import { Router } from 'express';

import AutorizacaoController from './AutorizacaoController';
import UsuarioController from './UsuarioController';
import SessaoController from './SessaoController';

const routes = Router();

[ UsuarioController, SessaoController, AutorizacaoController ].forEach((route) => {
    routes.stack = [...routes.stack, ...route.stack];
});

export default routes;
