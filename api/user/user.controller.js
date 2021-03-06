'use strict';

// LIBRARIES

// SERVICES
import UserService from './user.service';

// ERRORS
import ApiError from '../../errors/ApiError';
import errors from '../../errors/errors';

class UserController {
  /**
   * Get list of users
   * restriction: 'admin'
   */
  index(req, res, next) {
    return UserService
      .findAll()
      .then(users => {
        res.status(200).json({users});
      })
      .catch(next);
  }

  /**
   * Creates a new user
   */
  create(req, res, next) {
    var user = req.body;
    var ctx = req.ctx;

    return UserService
      .create(user, ctx)
      .then(function(user) {
        res.status(201).json({user});
      })
      .catch(next);
  }

  /**
   * Updates a single user
   */
  update(req, res, next) {
    var user = req.user;
    var changes = req.body;
    var ctx = req.ctx;
    ctx.requester = user;

    UserService
      .update(user, changes, ctx)
      .then(function(updatedUser) {
        res.json({user: updatedUser});
      })
      .catch(next);
  }

  /**
   * Get a single user
   */
  show(req, res, next) {
    const user = req.user;
    const token = req.token;
    let id = req.params.user;

    if (id === 'self' || id === 'me') {
      if (token && !user) { //user is authenticated but not registered
        return next(new ApiError(errors.not_found_404.user_not_signed_up));
      }

      id = user.id;
    }

    if (isNaN(id)) {
      return next(new ApiError(errors.bad_request_400.invalid_user_id));
    }

    id = Number(id);

    if (user.id !== id && !user.isAdmin) {
      return next(new ApiError(errors.forbidden_403.user_permission_denied));
    }

    return UserService
      .findById(id)
      .tap(function(user) {
        if (!user) {
          throw new ApiError(errors.not_found_404.user_not_found);
        }
      })
      .then(user => {
        res.status(201).json({user});
      });
  }

  /**
   * Deletes a user
   * restriction: 'admin'
   */
  destroy(req, res, next) {
    const ctx = req.ctx;
    const id = req.params.id;

    ctx.requester = req.user;

    return UserService
      .delete(id, ctx)
      .then(function(user) {
        res.status(204).json({user});
      })
      .catch(next);
  }
}

var userController = new UserController();

export default userController;
