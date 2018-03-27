'use strict';


const Inbound = require('../lib/inbound.js');
const expect = require('chai').expect;

const InboundInstance = new Inbound({ 
    recipient: { id: '202775603642477' },
    timestamp: 1522001779718,
    sender: { id: '1841093565925442' },
    postback: { payload: 'get_started_hook', title: 'Get Started' } 
});

describe('Inbound module', () => {
    describe('processMessagingItem', () => {
        it('should export a function', () => {
            expect(InboundInstance.processMessagingItem).to.be.a('function');
        })
    })
});
