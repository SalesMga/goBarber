import {Router} from 'express';
import UserController from './app/controllers/UserController';

const routes = new Router(); //instancia uma nova rota

routes.post('/users', UserController.store);

export default routes;
