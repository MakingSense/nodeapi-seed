'use strict';

import {Router} from 'express';
import {loadAndEnforceAuthentication} from './auth/auth.service.js';

var router = new Router();

router.use((req, res, next) => {
  var requester = req.user && req.user.role ? req.user : null;
  req.ctx.requester = requester;
  next();
});

router.use('/users', require('./user'));
//router.use('/auth', require('./auth'));

module.exports = router;
