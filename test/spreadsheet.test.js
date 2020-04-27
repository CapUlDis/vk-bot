require('dotenv').config()
const sinon = require('sinon');
const expect = require('chai').expect;

const { GoogleTable } = require('../spreadsheet');
const logger = require('../logger');


describe('Tests for class GoogleTable.', function() {
    const testTable = new GoogleTable({ sheetID: process.env.SPREADSHEET_ID, sheetIndex: 1 });
    before(async () => {
        await testTable.getSheetRows();
        await testTable.sheet.setHeaderRow(['Период', 'Кухня', 'КВТ']);
    });

    after(async () => {
        await testTable.sheet.clear();
        await testTable.sheet.setHeaderRow(['Период', 'Кухня', 'КВТ']);
    });
    
    it('GoogleTable instance returns correct properties by getSheetRows method.', async () => {
        await testTable.getSheetRows();
        
        expect(testTable.sheet.title).to.equal('Тест');
        expect(testTable.sheet.headerValues).to.eql(['Период', 'Кухня', 'КВТ']);
    });

    it('should add and del row in real spreadsheet', async () => {
        await testTable.getSheetRows();
        await testTable.addRow({ Период: '20.04.2020', Кухня: 'Гусь', КВТ: 'Лось' });
        await testTable.getSheetRows();
        
        expect(testTable.rows[0]._rawData).to.eql(['пн, 20.04.20', 'Гусь', 'Лось']);

        await testTable.delRow(0);
        await testTable.getSheetRows();

        expect(testTable.rows[0]).to.equal(undefined);
    });

    it('getSheetRows method throws error and correct log.', async () => {
        const stub = sinon.stub(logger, 'error');
        const testFakeTable = new GoogleTable({ sheetID: 'foo', sheetIndex: 'bar' });
        await testFakeTable.getSheetRows();

        expect(logger.error.calledOnce).to.be.true;
        expect(stub.args[0][0]).to.include('Something went wrong with connection or object');

        stub.restore();
    });
});

    



