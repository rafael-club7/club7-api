import { Router } from 'express';

import AutorizacaoController from './AutorizacaoController';
import UsuarioController from './UsuarioController';
import SessaoController from './SessaoController';
import PlanoController from './PlanoController';
import CategoriaParceiroController from './CategoriaParceiroController';
import AssinaturaController from './AssinaturaController';
import ServicoController from './ServicoController';
import ParceiroController from './ParceiroController';
import IndicacaoController from './IndicacaoController';
import ServicoResgatadoController from './ServicoResgatadoController';
import DashboardController from './DashboardController';

const routes = Router();

[ 
    UsuarioController, 
    SessaoController, 
    AutorizacaoController, 
    PlanoController, 
    CategoriaParceiroController,
    AssinaturaController,
    ServicoController,
    ParceiroController,
    IndicacaoController,
    ServicoResgatadoController,
    DashboardController,
].forEach((route) => {
    routes.stack = [...routes.stack, ...route.stack];
});

export default routes;
