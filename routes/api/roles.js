
const express = require('express');
const router = express.Router();

const Role = require('../../models/roles');
const verifyToken = require('../../middleware/authentication');
const checkPermission = require('../../middleware/authorization');



/**
 * @route   GET /api/v1/roles
 * @desc    Get all roles with pagination
 * @access  Private
 * @params  page, limit, search
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/roles?page=1&limit=10&search=role
**/

router.get('/', verifyToken, checkPermission(['org.roles.read']), async (req, res) => {
    
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let search = req.query.search || null;

    let query = {};
    if (search) {
        query = { $text: { $search: search } };
    }

    let totalRoles = await Role.countDocuments(query)
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving roles',
                error: err
            });
        });

    let roles = await Role.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving roles',
                error: err
            });
        });

    res.status(200).json({
        status: 200,
        message: 'Roles retrieved successfully',
        data: {
            roles: roles,
            meta: {
                page: page,
                limit: limit,
                pages: Math.ceil(totalRoles / limit),
                total: totalRoles,
                search: search
            }
        }
    });

});



/**
 * @route   GET /api/v1/roles/:id
 * @desc    Get a role by id
 * @access  Private
 * @params  id
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/roles/:id
**/

router.get('/:id', verifyToken, checkPermission(['org.roles.read']), async (req, res) => {
    
    await Role.findOne({ role_id: req.params.id })
        .then(role => {
            res.status(200).json({
                status: 200,
                message: 'Role found',
                data: role
            });
        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error getting role',
                error: err
            });
        });
});



/**
 * @route   POST /api/v1/roles
 * @desc    Create a new role
 * @access  Private
 * @params  name, description, permissions
 * @return  message, data
 * @error   400, { error }
 * @status  201, 400
 * 
 * @example /api/v1/roles
**/

router.post('/', verifyToken, checkPermission(['org.roles.write']), async (req, res) => {

    let role = new Role({
        name: req.body.name,
        description: req.body.description,
        permissions: req.body.permissions
    });

    await role.save()
        .then(role => {
            res.status(201).json({
                status: 201,
                message: 'Role created successfully',
                data: role
            });
        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error creating role',
                error: err
            });
        });
});



/**
 * @route   PATCH /api/v1/roles/:id
 * @desc    Update a role by id
 * @access  Private
 * @params  id, name, description, permissions
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/roles/:id
**/

router.patch('/:id', verifyToken, checkPermission(['org.roles.write']), async (req, res) => {
    
    await Role.findOneAndUpdate({ role_id: req.params.id }, {
        name: req.body.name,
        description: req.body.description,
        permissions: req.body.permissions
    })
        .then(role => {
            res.status(200).json({
                status: 200,
                message: 'Role updated',
                data: role
            });
        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error updating role',
                error: err
            });
        });
});



/**
 * @route   DELETE /api/v1/roles/:id
 * @desc    Delete a role by id
 * @access  Private
 * @params  id
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/roles/:id
**/

router.delete('/:id', verifyToken, checkPermission(['org.roles.destroy']), async (req, res) => {
    
    await Role.findOneAndDelete({ role_id: req.params.id })
        .then(role => {
            res.status(200).json({
                status: 200,
                message: 'Role deleted',
                data: role
            });
        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error deleting role',
                error: err
            });
        });
});



module.exports = router;