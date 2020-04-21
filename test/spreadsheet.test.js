require('dotenv').config()
const sinon = require('sinon');
const assert = require('chai').assert;

const { GoogleTable } = require('../spreadsheet');
const logger = require('../logger');


describe('Tests for class GoogleTable.', function() {
    
    it('GoogleTable instance returns correct properties by getSheetRows method.', async () => {
        const testTable = new GoogleTable({ sheetID: process.env.SPREADSHEET_ID, sheetIndex: process.env.SHEET_INDEX });
        await testTable.getSheetRows();
        assert.equal(testTable.sheet.title, 'Тест');
    });

    it('getSheetRows method throws error and correct log.', async () => {
        const stub = sinon.stub(logger, 'error');
        const testTable = new GoogleTable({ sheetID: 'foo', sheetIndex: 'bar' });
        await testTable.getSheetRows();
        assert.isTrue(logger.error.calledOnce);
        assert.isTrue(stub.args[0][0].includes("Something went wrong with connection or object"));
        stub.restore();
    });
});

    



