import { Router } from 'express';

const routes = Router();

routes.get('/sessao', async (req, res) => {
    res.send({
        status: 1,
        data: req.sessao
    });
});

export default routes;
