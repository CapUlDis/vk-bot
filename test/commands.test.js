require('dotenv').config()
const proxyquire = require('proxyquire').noPreserveCache();
const { expect } = require('chai');
const sinon = require('sinon');
const moment = require('moment');
const { GoogleTable } = require('../spreadsheet');
const logger = require('../logger');


moment.locale('ru');
moment.updateLocale('ru', {
    longDateFormat : {
        LTS: 'H:mm:ss',
        LT: 'H:mm',
        L: 'DD.MM.YYYY',
        LL: 'dd, DD.MM.YY',
        LLL: 'D MMMM YYYY г., H:mm',
        LLLL: 'dddd, D MMMM YYYY г., H:mm'
    }
});

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

describe('Test fillScheduleByLastDuties command.', () => {
    process.env.SHEET_INDEX = 1;
    const { fillScheduleByLastDuties } = proxyquire('../commands', {});

    beforeEach(async () => {
        await testTable.getSheetRows();
        await testTable.sheet.setHeaderRow(['Период', 'Кухня', 'КВТ']);
    });

    afterEach(async () => {
        await testTable.sheet.clear();
        await testTable.sheet.setHeaderRow(['Период', 'Кухня', 'КВТ']);
    });

    it('should say: График пустой, нечем заполнять.', async () => {
        const message = await new Promise(resolve => fillScheduleByLastDuties({ reply: resolve }));
        expect(message).to.include('График пустой, нечем заполнять.');
    });

    it('should say: Дежурство составлено как минимум на две недели вперёд.', async () => {
        let testDate = moment().add(15, 'days');
        await testTable.addRow({ Период: testDate.format('L'), Кухня: 'Гусь', КВТ: 'Лось' });

        const message = await new Promise(resolve => fillScheduleByLastDuties({ reply: resolve }));
        expect(message).to.include('Дежурство составлено как минимум на две недели вперёд.');
    });
    
    it('should say: График дежурств заполнен. Table are filled by uneven number of duties and from last date in schedule.', async () => {
        let date1 = moment();
        let date2 = moment().add(7, 'days');
        await testTable.addRow({ Период: date1.format('L'), Кухня: 'Гусь', КВТ: 'Лось' });
        await testTable.addRow({ Период: date2.format('L'), Кухня: 'Краб', КВТ: 'Гусь' });

        const message = await new Promise(resolve => fillScheduleByLastDuties({ reply: resolve }));
        await testTable.getSheetRows();
        expect(message).to.include('График дежурств заполнен.');
        expect(testTable.rows[2]._rawData).to.eql([date2.add(7, 'days').format('LL'), 'Лось', 'Краб']);
        expect(testTable.rows[3]._rawData).to.eql([date2.add(7, 'days').format('LL'), 'Гусь', 'Лось']);
    });
    
    it('should say: График дежурств заполнен. Table are filled by even number of duties and from today.', async () => {
        let date1 = moment().subtract(14, 'days');
        let date2 = moment().subtract(7, 'days');
        await testTable.addRow({ Период: date1.format('L'), Кухня: 'Гусь', КВТ: 'Лось' });
        await testTable.addRow({ Период: date2.format('L'), Кухня: 'Краб', КВТ: 'Червь' });

        const message = await new Promise(resolve => fillScheduleByLastDuties({ reply: resolve }));
        await testTable.getSheetRows();
        expect(message).to.include('График дежурств заполнен.');
        expect(testTable.rows[2]._rawData).to.eql([moment().add(7, 'days').format('LL'), 'Лось', 'Гусь']);
        expect(testTable.rows[3]._rawData).to.eql([moment().add(14, 'days').format('LL'), 'Червь', 'Краб']);
    });

    it('should say: Что-то пошло не так...', async () => {
        let initialEnvVar = process.env.SPREADSHEET_ID;

        const stub = sinon.stub(logger, 'error');
        process.env.SPREADSHEET_ID = 'foo';
        const { fillScheduleByLastDuties } = proxyquire('../commands', {});

        const message = await new Promise(resolve => fillScheduleByLastDuties({ reply: resolve }));
        expect(logger.error.calledTwice).to.be.true;
        expect(stub.args[0][0]).includes('Something went wrong with connection or object');
        expect(message).to.include('Что-то пошло не так с таблицей.');

        process.env.SPREADSHEET_ID = initialEnvVar;
        stub.restore();
    });
});