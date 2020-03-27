require('dotenv').config()
const sinon = require('sinon');
const assert = require('chai').assert;

const { GoogleTable } = require('../spreadsheet');
const logger = require('../logger');


describe('Tests for class GoogleTable.', function() {
    
    it('GoogleTable instance returns correct properties by getDocInfo method.', async () => {
        const test_table = new GoogleTable(process.env.SPREADSHEET_ID);
        await test_table.getDocInfo();
        assert.equal(test_table.sheet.title, 'График Дежурств');
    });

    it('getDocInfo method throws error and correct log.', async () => {
        const stub = sinon.stub(logger, 'error');
        const test_table = new GoogleTable('foo');
        await test_table.getDocInfo();
        assert.isTrue(logger.error.calledOnce);
        assert.isTrue(stub.args[0][0].includes("Can't connect to Google Spreadsheet."));
        stub.restore();
    });
});

    



