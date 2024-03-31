
const express = require('express');
const router = express.Router();

const Users = require('../../models/users');
const verifyToken = require('../../middleware/authentication');
const checkPermission = require('../../middleware/authorization');



/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination
 * @access  Private
 * @params  page, limit, search
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/users?page=1&limit=10&search=resource
 * 
 * @todo    Add search
 * @todo    Add filter by category
**/

router.get('/', async (req, res) => {

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let search = req.query.search || null;

    let query = {};
    if (search) {
        query = { $text: { $search: search } };
    }

    let totalUsers = await Users.countDocuments(query)
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving users',
                error: err
            });
        });

    let users = await Users.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving users',
                error: err
            });
        });

    res.status(200).json({
        status: 200,
        message: 'Users retrieved successfully',
        data: {
            users: users,
            meta: {
                page: page,
                limit: limit,
                pages: Math.ceil(totalUsers / limit),
                total: totalUsers,
                search: search
            }
        }
    });

});



module.exports = router;