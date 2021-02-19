import { callMethod } from '@konecty/utils/methods';

import { sessionUserAndGetAccessFor } from '../app/middlewares';

const init = app => {
	/* @Add_File */
	app.post('/rest/file2/:document/:recordCode/:fieldName', (req, res) =>
		sessionUserAndGetAccessFor('document')(req, res, async function () {
			const result = await callMethod('file:upload', req);
			res.send(result);
		}),
	);

	/* @Remove_File */
	app.del('/rest/file2/:document/:recordCode/:fieldName/:fileName', (req, res) =>
		sessionUserAndGetAccessFor('document')(req, res, async function () {
			const result = await callMethod('file:remove', req);
			res.send(result);
		}),
	);
};

export { init };
