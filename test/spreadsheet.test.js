const assert = require('chai').assert;
const expect = require('chai').expect;
const { GoogleTable } = require('../spreadsheet');
require('dotenv').config()


describe('Tests for class GoogleTable.', function() {
    
    it('GoogleTable instance returns correct properties by getDocInfo method.', async () => {
        const test_table = new GoogleTable(process.env.SPREADSHEET_ID);
        await test_table.getDocInfo();
        assert.equal(test_table.sheet.title, 'График Дежурств');
    });
});

    // it('getDocInfo method throws error and log.', async () => {
    //     const test_table = new GoogleTable('foo');
    //     await test_table.getDocInfo();
    // })