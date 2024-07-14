
const express = require('express');
const router = express.Router();

const StockLog = require('../../../models/stock/stock_logs');
const verifyToken = require('../../../middleware/authentication');
const checkPermission = require('../../../middleware/authorization');

const { stockLogApproval } = require('../../../helpers/stockHelper');



/**
 * @route   GET /api/v1/stock/stock_logs
 * @desc    Get all stock logs of an organization with pagination
 * @access  Public
 * @params  page, limit, search
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/stock/stock_logs?page=1&limit=10&search=resource
 * 
 * @todo    Add search
 * @todo    Add filter by category
**/

router.get('/', verifyToken, checkPermission(['org.stock_logs.read']), async (req, res) => {

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let search = req.query.search || null;

    let query = {};
    if (search) {
        query = { $text: { $search: search } };
    }

    let totalStockLogs = await StockLog.countDocuments(query)
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving stock logs',
                error: err
            });
        });

    let stock_logs = await StockLog.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving stock logs',
                error: err
            });
        });

    res.status(200).json({
        status: 200,
        message: 'Stock logs retrieved successfully',
        data: {
            stock_logs: stock_logs,
            meta: {
                page: page,
                limit: limit,
                pages: Math.ceil(totalStockLogs / limit),
                total: totalStockLogs,
                search: search
            }
        }
    });

});



/**
 * @route   GET /api/v1/stock/stock_logs/me
 * @desc    Get stock logs by user with pagination
 * @access  Public
 * @params  page, limit, search
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/stock/stock_logs/me?page=1&limit=10&search=resource
 * 
 * @todo    Add search
 * @todo    Add filter by category
**/

router.get('/me', verifyToken, checkPermission(['own.stock_logs.read']), async (req, res) => {

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let search = req.query.search || null;

    let query = { user_id: req.user.user_id };
    if (search) {
        query = { $text: { $search: search }, user_id: req.user.user_id };
    }

    let totalStockLogs = await StockLog.countDocuments(query)
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving stock logs',
                error: err
            });
        });

    let stock_logs = await StockLog.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error retrieving stock logs',
                error: err
            });
        });

    res.status(200).json({
        status: 200,
        message: 'Stock logs retrieved successfully',
        data: {
            stock_logs: stock_logs,
            meta: {
                page: page,
                limit: limit,
                pages: Math.ceil(totalStockLogs / limit),
                total: totalStockLogs,
                search: search
            }
        }
    });

});



/**
 * @route   POST /api/v1/stock/stock_logs
 * @desc    Add new stock log
 * @access  Private
 * @params  stock_id, quantity, action
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/stock/stock_logs
**/

router.post('/', verifyToken, checkPermission(['org.stock_logs.write', 'own.stock_logs.write'], 'any'), async (req, res) => {

    let stockLog = new StockLog({
        user_id: req.body.user_id,
        components: req.body.components,
        mode: req.body.mode
    });

    if (stockLog.mode === 'stock_return') {
        stockLog.status = 'exit.pending';
    }

    stockLog.save()
        .then(data => {
            res.status(200).json({
                status: 200,
                message: 'Stock log added successfully',
                // data: data
            });
        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error adding stock log',
                error: err
            });
        });

});



/**
 * @route   PATCH /api/v1/stock/stock_logs/:stocklog_id
 * @desc    Update a stock log
 * @access  Private
 * @params  stocklog_id
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/stock/stock_logs/60b1e6e7f6d2b4e6e8f4b8e2
**/

router.patch('/:stocklog_id', verifyToken, checkPermission(['org.stock_logs.write', 'own.stock_logs.write'], 'any'), async (req, res) => {

    await StockLog.findOneAndUpdate({ stocklog_id: req.params.stocklog_id }, {

        user_id: req.body.user_id,
        components: req.body.components,
        mode: req.body.mode,
        updated_at: Date.now()

    }, { new: true })
        .then(data => {
            res.status(200).json({
                status: 200,
                message: 'Stock log updated successfully',
                // data: data
            });
        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error updating stock log',
                error: err
            });
        });

});



/**
 * @route   DELETE /api/v1/stock/stock_logs/:stocklog_id
 * @desc    Delete a stock log
 * @access  Private
 * @params  stocklog_id
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/stock/stock_logs/60b1e6e7f6d2b4e6e8f4b8e2
**/

router.delete('/:stocklog_id', verifyToken, checkPermission(['org.stock_logs.destroy', 'own.stock_logs.destroy'], 'any'), async (req, res) => {

    await StockLog.findOneAndDelete({ stocklog_id: req.params.stocklog_id })
        .then(data => {
            res.status(200).json({
                status: 200,
                message: 'Stock log deleted successfully',
                // data: data
            });
        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                message: 'Error deleting stock log',
                error: err
            });
        });

});



/**
 * @route   PATCH /api/v1/stock/stock_logs/approve/:stocklog_id
 * @desc    Stock log approval
 * @access  Public
 * @params  stocklog_id
 * @return  message, data
 * @error   400, { error }
 * @status  200, 400
 * 
 * @example /api/v1/stock/stock_logs/approve/60b1e6e7f6d2b4e6e8f4b8e2
**/

router.patch('/approve/:stocklog_id', verifyToken, checkPermission(['org.stock_logs.write']), async (req, res) => {

    let stocklog_id = req.params.stocklog_id;
    let approver_id = req.body.approver_id;
    let mode = req.body.mode;

    await stockLogApproval(stocklog_id, mode, approver_id)
        .then(data => {
            res.status(data.status).json({
                status: data.status,
                message: data.message,
                // data: data
            });
        })
        .catch(err => {
            res.status(err.status).json({
                status: err.status,
                message: err.message,
                error: err.error
            });
        });

});



module.exports = router;