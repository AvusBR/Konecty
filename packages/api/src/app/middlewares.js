import size from 'lodash/size';
import isObject from 'lodash/isObject';

import { Models } from '@konecty/metadata';
import { hashLoginToken } from '@konecty/utils/password';

import { getAccessFor as utilsGetAccessFor } from '@konecty/utils/access';

// Middleware to get user and populate into request
const user = async function (req, res, next) {
	const token = req.cookies['_authTokenId'] || req.cookies['authTokenId'] || req.headers['authorization'];

	if (size(token) > 0) {
		const hashedToken = hashLoginToken(token);

		// Find User from session
		req.user = await Models.User.findOne({ 'services.resume.loginTokens.hashedToken': { $in: [token, hashedToken] } });

		// If no user was found return error
		if (!req.user) {
			return res.send(new Error("[internal-error] Token doesn't exists"));
		}

		if (req.user.active !== true) {
			return res.send(new Error('[internal-error] User inactive'));
		}

		// If everithing is awesome go to next step
		next();
	} else {
		return res.send(new Error("[internal-error] Token doesn't exists"));
	}
};

// Middleware to get access of user and document
const getAccessFor = documentParamName =>
	function (req, res, next) {
		const documentName = req.params[documentParamName];

		// If no param was found with document name return 401 (Unauthorized)
		if (!documentName) {
			return res.send(401);
		}

		// Find access
		const access = utilsGetAccessFor(documentName, req.user);

		// If return is false no access was found then return 401 (Unauthorized)
		if (access === false) {
			return res.send(401);
		}

		// If return is object then set access into requrest
		if (isObject(access)) {
			req.access = access;
			return next();
		}

		// Return 401 (Unauthorized) if no access was found
		return res.send(401);
	};

// Middleware to get session, user and access
const sessionUserAndGetAccessFor = documentParamName => (req, res, next) =>
	user(req, res, function () {
		const fn = utilsGetAccessFor(documentParamName);
		return fn(req, res, next);
	});

export { user, getAccessFor, sessionUserAndGetAccessFor };