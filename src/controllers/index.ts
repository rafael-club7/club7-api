import { Router } from 'express';

const routes = Router();

[].forEach((route) => {
    routes.stack = [...routes.stack, ...route.stack];
});

export default routes;
