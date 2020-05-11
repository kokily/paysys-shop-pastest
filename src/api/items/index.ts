import Router from 'koa-router';
import { isAdminIn } from '../../libs/utils';
import * as itemsCtrl from './items.ctrl';

const items = new Router();

items.post('/', isAdminIn, itemsCtrl.addItem);
items.get('/', isAdminIn, itemsCtrl.listItems);

const item = new Router();

item.get('/', isAdminIn, itemsCtrl.readItem);
item.delete('/', isAdminIn, itemsCtrl.removeItem);
item.patch('/', isAdminIn, itemsCtrl.updateItem);

items.use('/:id', isAdminIn, itemsCtrl.getById, item.routes());

export default items;
