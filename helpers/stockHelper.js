
const StockLog = require('../models/stock/stock_logs');
const UserLog = require('../models/stock/user_logs');


module.exports = {

    stockLogApproval: async (stocklog_id, mode, approver_id) => {
        return new Promise(async (resolve, reject) => {

            let query = {
                mode: mode,
                status: mode === 'stock_return' ? 'exit.approved' : 'entry.approved',
                approver_id: approver_id,
                updated_at: Date.now()
            };
            
            await StockLog.findOneAndUpdate({ stocklog_id: stocklog_id }, query)
                .then(async data => {
        
                    let mode = data.mode;
                    mode === 'stock_return' ? query.status = 'exit.approved' : query.status = 'entry.approved';
        
                    await UserLog.findOne({ user_id: data.user_id })
                        .then(async userLog => {
        
                            // if user log not found, create new user log
                            if (!userLog) {
                                userLog = new UserLog({
                                    user_id: data.user_id,
                                    components: [],
                                    created_at: Date.now(),
                                    updated_at: Date.now()
                                });
                            } else {
                                userLog.updated_at = Date.now();
                            }
        
                            // add components to user log
                            data.components.forEach(component => {
        
                                // check if component already exists in user log
                                // if exists, update qty. else, add new component
                                let componentIndex = userLog.components.findIndex(c => c.device_id === component.device_id);
        
                                if (componentIndex !== -1) {
        
                                    if(mode === 'stock_return') {
                                        userLog.components[componentIndex].qty -= component.qty;
                                    } else {
                                        userLog.components[componentIndex].qty += component.qty;
                                    }
                                    
                                    if (userLog.components[componentIndex].qty <= 0) {
                                        userLog.components.splice(componentIndex, 1);
                                    } else {
                                        userLog.components[componentIndex].updated_at = data.updated_at;
                                        userLog.components[componentIndex].approver.push({
                                            approver_id: approver_id,
                                            action: query.status
                                        });
                                    }
        
                                } else {
                                    let newComponent = {
                                        device_id: component.device_id,
                                        name: component.name,
                                        qty: component.qty,
                                        created_at: data.updated_at,
                                        updated_at: data.updated_at,
                                        approver: [
                                            {
                                                approver_id: approver_id,
                                                action: query.status
                                            }
                                        ]
                                    };
                                    userLog.components.push(newComponent);
                                }
        
                            });
        
        
                            // if no more components in user log, delete user log
                            if (userLog.components.length == 0) {
        
                                // delete user log
                                await UserLog.findOneAndDelete({ user_id: data.user_id })
                                    .then(data => {
                                        // res.status(200).json({
                                        //     status: 200,
                                        //     message: 'User log deleted successfully',
                                        //     // data: data
                                        // });
                                        resolve({
                                            status: 200,
                                            message: [
                                                'Stock log approved successfully',
                                                'User log deleted successfully'
                                            ]
                                            // data: data
                                        });
                                    })
                                    .catch(err => {
                                        // res.status(400).json({
                                        //     status: 400,
                                        //     message: 'Error deleting user log',
                                        //     error: err
                                        // });
                                        reject({
                                            status: 400,
                                            message: [
                                                'Stock log approved successfully',
                                                'Error deleting user log'
                                            ],
                                            error: err
                                        });
                                    });
                                
                            } else {
        
                                // save user log
                                await userLog.save()
                                    .then(data => {
                                        // res.status(200).json({
                                        //     status: 200,
                                        //     message: 'Stock log approved successfully',
                                        //     // data: data
                                        // });
                                        resolve({
                                            status: 200,
                                            message: [
                                                'Stock log approved successfully',
                                                'User log updated successfully'
                                            ]
                                            // data: data
                                        });
                                    })
                                    .catch(err => {
                                        // res.status(400).json({
                                        //     status: 400,
                                        //     message: 'Error approving stock log',
                                        //     error: err
                                        // });
                                        reject({
                                            status: 400,
                                            message: [
                                                'Stock log approved successfully',
                                                'Error updating user log'
                                            ],
                                            error: err
                                        });
                                    });
        
                            }
        
                        })
                        .catch(err => {
                            res.status(400).json({
                                status: 400,
                                message: 'Error retrieving user log',
                                error: err
                            });
                        });
                    
                })
                .catch(err => {
                    res.status(400).json({
                        status: 400,
                        message: 'Error approving stock log',
                        error: err
                    });
                });

        });
    },

};