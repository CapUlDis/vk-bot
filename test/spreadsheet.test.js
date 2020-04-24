require('dotenv').config()
const sinon = require('sinon');
const assert = require('chai').assert;
const expect = require('chai').expect;

const { GoogleTable } = require('../spreadsheet');
const logger = require('../logger');


describe('Tests for class GoogleTable.', function() {
    const testTable = new GoogleTable({ sheetID: process.env.SPREADSHEET_ID, sheetIndex: 1 });
    
    it('GoogleTable instance returns correct properties by getSheetRows method.', async () => {
        await testTable.getSheetRows();
        assert.equal(testTable.sheet.title, 'Тест');
        assert.equal(testTable.sheet.headerValues[0], 'Период');
        assert.equal(testTable.sheet.headerValues[1], 'Кухня');
        assert.equal(testTable.sheet.headerValues[2], 'КВТ');
    });

    it('getSheetRows method throws error and correct log.', async () => {
        const stub = sinon.stub(logger, 'error');
        const testFakeTable = new GoogleTable({ sheetID: 'foo', sheetIndex: 'bar' });
        await testFakeTable.getSheetRows();
        assert.isTrue(logger.error.calledOnce);
        assert.isTrue(stub.args[0][0].includes("Something went wrong with connection or object"));
        stub.restore();
    });
});

    



