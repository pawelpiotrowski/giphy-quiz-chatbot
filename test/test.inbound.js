'use strict';

const config = require('../config');
const Inbound = require('../lib/inbound.js');
const expect = require('chai').expect;
const sinon = require('sinon');
const DB = require('../lib/db');
const knexCleaner = require('knex-cleaner');

describe('InboundTest', () => {
    
    const InboundInstance = new Inbound({ 
        recipient: { id: '987654321' },
        timestamp: 1522001779718,
        sender: { id: '123456789' },
        postback: { payload: 'get_started_hook', title: 'Get Started' } 
    });

    describe('processMessagingItem', () => {
        it('should produce inbound item from messaging item', async () => {
            function testInbound() {
                const inboundItem = InboundInstance.getInboundItem();
                expect(inboundItem.type).to.equal('postback');
                expect(inboundItem.threadKey).to.equal('get_started_hook');
                expect(inboundItem.cargo).to.deep.equal({
                    payload: 'get_started_hook', title: 'Get Started'
                });
                stubSyncSenderData.restore();
                stubRoutine.restore();
            }
            // stub sync sender data
            const stubSyncSenderData = sinon.stub(InboundInstance, 'syncSenderData').callsFake(() => {
                return new Promise(resolve => {
                    resolve();
                });
            });
            // replace routine with callback to check inbound item
            const stubRoutine = sinon.stub(InboundInstance, 'routine').callsFake(testInbound);
            // trigger
            InboundInstance.processMessagingItem();
        });
    });

    describe('syncSenderData', () => {
        it('should create user data with fallback to default language', async () => {
            // stub sync sender data
            await InboundInstance.syncSenderData();
            const testUsr = await DB('users').where({ fbid: '123456789' });
            expect(testUsr[0].fbid).to.be.equal('123456789');
            expect(testUsr[0].dialog_name).to.be.equal(config.defaultDialog);
            expect(testUsr[0].lang).to.be.equal(config.locales[0]);
            await knexCleaner.clean(DB);
        });
    });
});
