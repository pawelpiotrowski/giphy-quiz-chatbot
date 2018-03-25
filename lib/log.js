'use strict';

const _ = require('lodash');
const chalk = require('chalk');

const isLive = (process.env.NODE_ENV === 'live');

module.exports = {
    logInLoop(messages) {
        if(messages && messages.length) {
            if(_.isArray(messages)) {
                messages.forEach(msg => {
                    console.log(msg);
                    process.stdout.write('\n');
                });
            } else {
                console.log(messages + '\n');
            }
        }
    },
    addLog(log) {
        if(!isLive) {
            this.logInLoop(log.payload);
        }
    },
    status(msg) {
        console.log(chalk.cyan('\nStatus: ' + msg[0]), '\n');
        this.addLog({
            msg: msg[0],
            type: 'status',
            payload: msg[1]
        });
    },
    info(msg) {
        if(!isLive) {
            console.log(chalk.grey('Info: ' + msg[0]), '\n');
        }
        this.addLog({
            msg: msg[0],
            type: 'info',
            payload: msg[1]
        });
    },
    ok(msg) {
        console.log(chalk.green('\u2714 OK: '), chalk.grey(msg[0]), '\n');
        this.addLog({
            msg: msg[0],
            type: 'ok',
            payload: msg[1]
        });
    },
    success(msg) {
        console.log(chalk.green('Success: ' + msg[0]), '\n');
        this.addLog({
            msg: msg[0],
            type: 'success',
            payload: msg[1]
        });
    },
    warning(msg) {
        console.log(chalk.yellow('Warning: ' + msg[0]), '\n');
        this.addLog({
            msg: msg[0],
            type: 'warning',
            payload: msg[1]
        });
    },
    error(msg) {
        console.log(chalk.red('Error: ' + msg[0]), '\n');
        this.addLog({
            msg: msg[0],
            type: 'error',
            payload: msg[1]
        });
    }
};
