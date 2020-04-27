require('dotenv').config()
const proxyquire = require('proxyquire').noPreserveCache();
const { expect } = require('chai');
const sinon = require('sinon');
const moment = require('moment');
moment.locale('ru');
const { GoogleTable } = require('../spreadsheet');
const logger = require('../logger');


const testTable = new GoogleTable({ sheetID: process.env.SPREADSHEET_ID, sheetIndex: 1 });

describe('Test getCurrentDuties command.', () => {
    process.env.SHEET_INDEX = 1;
    const { getCurrentDuties } = proxyquire('../commands', {});

    before(async () => {
        await testTable.getSheetRows();
        await testTable.sheet.setHeaderRow(['Период', 'Кухня', 'КВТ']);
    });

    after(async () => {
        await testTable.sheet.clear();
        await testTable.sheet.setHeaderRow(['Период', 'Кухня', 'КВТ']);
    });

    it('should say: График дежурств пустой...', async () => {
        const message = await new Promise(resolve => getCurrentDuties({ reply: resolve }));
        expect(message).to.include('График дежурств пустой.');
    });

    it('should say: В срок до...', async () => {
        let today = moment();
        let weekAfter = moment().add(7, 'days');
        await testTable.getSheetRows();
        await testTable.addRow({ Период: today.format('L'), Кухня: 'Гусь', КВТ: 'Лось' });
        await testTable.addRow({ Период: weekAfter.format('L'), Кухня: 'Ёрш', КВТ: 'Краб' });

        const message = await new Promise(resolve => getCurrentDuties({ reply: resolve }));
        expect(message).to.include(`В срок до ${weekAfter.format('L')} дежурят по кухне - Ёрш, по КВТ - Краб.`);

        await testTable.delRow(1);
        await testTable.delRow(0);
    });

    it('should say: На текущий период...', async () => {
        let weekAfter = moment().subtract(7, 'days');
        await testTable.getSheetRows();
        await testTable.addRow({ Период: weekAfter.format('L'), Кухня: 'Гусь', КВТ: 'Лось' });

        const message = await new Promise(resolve => getCurrentDuties({ reply: resolve }));
        expect(message).to.include('На текущий период дежурств не запланировано.');

        await testTable.delRow(0);
    });

    it('should say: Что-то пошло не так...', async () => {
        let initialEnvVar = process.env.SPREADSHEET_ID;

        const stub = sinon.stub(logger, 'error');
        process.env.SPREADSHEET_ID = 'foo';
        const { getCurrentDuties } = proxyquire('../commands', {});

        const message = await new Promise(resolve => getCurrentDuties({ reply: resolve }));
        expect(logger.error.calledTwice).to.be.true;
        expect(stub.args[0][0]).includes('Something went wrong with connection or object');
        expect(message).to.include('Что-то пошло не так с таблицей.');

        process.env.SPREADSHEET_ID = initialEnvVar;
        stub.restore();
    });
});