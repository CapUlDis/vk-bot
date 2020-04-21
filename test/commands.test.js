require('dotenv').config()
const proxyquire = require('proxyquire').noPreserveCache();
const { expect } = require('chai');
const sinon = require('sinon');
const moment = require('moment');
moment.locale('ru');
const { GoogleTable } = require('../spreadsheet');
const logger = require('../logger');


const tableTest = new GoogleTable({ sheetID: process.env.SPREADSHEET_ID, sheetIndex: 1 });

describe('Test getCurrentDuties command.', () => {
    process.env.SHEET_INDEX = 1;
    const { getCurrentDuties } = proxyquire('../commands', {});

    it('should say: График дежурств пустой...', async () => {
        const message = await new Promise(resolve => getCurrentDuties({ reply: resolve }));
        expect(message).to.include('График дежурств пустой.');
    });

    it('should say: В срок до...', async () => {
        let today = moment();
        let weekAfter = moment().add(7, 'days');
        await tableTest.getSheetRows();
        await tableTest.addRow({ Период: today.format('L'), Кухня: 'Гусь', КВТ: 'Лось' });
        await tableTest.addRow({ Период: weekAfter.format('L'), Кухня: 'Ёрш', КВТ: 'Краб' });

        const message = await new Promise(resolve => getCurrentDuties({ reply: resolve }));
        expect(message).to.include(`В срок до ${weekAfter.format('L')} дежурят по кухне - Ёрш, по КВТ - Краб.`);

        await tableTest.delRow(1);
        await tableTest.delRow(0);
    });

    it('should say: На текущий период...', async () => {
        let weekAfter = moment().subtract(7, 'days');
        await tableTest.getSheetRows();
        await tableTest.addRow({ Период: weekAfter.format('L'), Кухня: 'Гусь', КВТ: 'Лось' });

        const message = await new Promise(resolve => getCurrentDuties({ reply: resolve }));
        expect(message).to.include('На текущий период дежурств не запланировано.');

        await tableTest.delRow(0);
    });

    it('should say: Ошибка...', async () => {
        let initialEnvVar = process.env.SPREADSHEET_ID;

        const stub = sinon.stub(logger, 'error');
        process.env.SPREADSHEET_ID = 'foo';
        const { getCurrentDuties } = proxyquire('../commands', {});

        const message = await new Promise(resolve => getCurrentDuties({ reply: resolve }));
        expect(logger.error.calledTwice).to.be.true;
        expect(stub.args[0][0]).includes('Something went wrong with connection or object');
        expect(message).to.include('Ошибка: нет доступа к гугл таблице!');

        process.env.SPREADSHEET_ID = initialEnvVar;
        stub.restore();
    });
});