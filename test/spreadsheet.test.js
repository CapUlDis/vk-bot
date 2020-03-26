const assert = require('chai').assert;
const expect = require('chai').expect;
const { GoogleTable } = require('../spreadsheet');
require('dotenv').config()


describe('Tests for spreadsheet functionlities.', function() {
    it('GoogleTable instance returns correct properties.', async () => {
        const test_table = new GoogleTable(process.env.SPREADSHEET_ID);
        await test_table.getDocInfo();
        assert.equal(test_table.sheet.title, 'График Дежурств');
    });
});
