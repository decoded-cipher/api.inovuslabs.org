
const express = require('express');
const router = express.Router();

const Permission = require('../../models/permissions');
const verifyToken = require('../../middleware/authentication');
const checkPermission = require('../../middleware/authorization');



/**
 * @route   GET /api/v1/permissions
 * @desc    Get all permissions with pagination
 * @access  Private
 * @params  page, limit, search
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/permission?page=1&limit=10&search=permission
 * 
 * @todo    Add search
 * @todo    Add filter by category
**/

router.get('/', verifyToken, checkPermission(['org.permission.read']), async (req, res) => {

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let search = req.query.search || null;

    let query = {};
    if (search) {
        query = { $text: { $search: search } };
    }

    let totalPermissions = await Permission.countDocuments(query)
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving permissions',
                error: err
            });
        });

    let permissions = await Permission.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving permissions',
                error: err
            });
        });

    res.status(200).json({
        status: 200,
        message: 'Permissions retrieved successfully',
        data: {
            permissions: permissions,
            meta: {
                page: page,
                limit: limit,
                pages: Math.ceil(totalPermissions / limit),
                total: totalPermissions,
                search: search
            }
        }
    });

});



/**
 * @route   GET /api/v1/permissions/:id
 * @desc    Get a permission by ID
 * @access  Private
 * @params  id
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/permissions/5e0e2b8f3e5b9a2f1c6c4b3d
**/

router.get('/:id', verifyToken, checkPermission(['org.permission.read']), async (req, res) => {
    
    await Permission.findById(req.params.id)
        .then(permission => {
            res.status(200).json({
                status: 200,
                message: 'Permission found',
                data: permission
            });
        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error getting permission',
                error: err
            });
        });
});



/**
 * @route   POST /api/v1/permissions
 * @desc    Create a new permission
 * @access  Private
 * @params  name, description
 * @return  message, data
 * @error   400, { error }
 * @status  201, 400
 * 
 * @example /api/v1/permissions
**/

router.post('/', verifyToken, checkPermission(['org.permission.write']), async (req, res) => {
    
    let permission = new Permission({
        name: req.body.name,
        description: req.body.description
    });

    await permission.save()
        .then(permission => {
            res.status(201).json({
                status: 201,
                message: 'Permission created successfully',
                data: permission
            });
        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error creating permission',
                error: err
            });
        });
});



/**
 * @route   PATCH /api/v1/permissions/:id
 * @desc    Update a permission by ID
 * @access  Private
 * @params  name, description
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/permissions/5e0e2b8f3e5b9a2f1c6c4b3d
**/

router.patch('/:id', verifyToken, checkPermission(['org.permission.write']), async (req, res) => {
    
    await Permission.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.description
    }, { new: true })
        .then(permission => {
            res.status(200).json({
                status: 200,
                message: 'Permission updated successfully',
                data: permission
            });
        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error updating permission',
                error: err
            });
        });
});



/**
 * @route   DELETE /api/v1/permissions/:id
 * @desc    Delete a permission by ID
 * @access  Private
 * @params  id
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/permissions/5e0e2b8f3e5b9a2f1c6c4b3d
**/

router.delete('/:id', verifyToken, checkPermission(['org.permission.destroy']), async (req, res) => {
    
    await Permission.findByIdAndDelete(req.params.id)
        .then(permission => {
            res.status(200).json({
                status: 200,
                message: 'Permission deleted successfully',
                data: permission
            });
        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error deleting permission',
                error: err
            });
        });
});



module.exports = router;