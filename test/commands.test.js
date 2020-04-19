const { expect } = require('chai');
const { getCurrentDuties } = require('../commands');
const { tableM3 } = require('../commands');
const moment = require('moment');
moment.locale('ru');


describe('Test getCurrentDuties command.', () => {
    it('should say: График дежурств пустой...', async () => {
        const message = await new Promise(resolve => getCurrentDuties({ reply: resolve }));
        expect(message).to.include('График дежурств пустой.');
    });

    it('should say: В срок до...', async () => {
        let today = moment();
        let weekAfter = moment().add(7, 'days');
        await tableM3.getSheetRows();
        await tableM3.addRow({ Период: today.format('L'), Кухня: 'Гусь', КВТ: 'Лось' });
        await tableM3.addRow({ Период: weekAfter.format('L'), Кухня: 'Ёрш', КВТ: 'Краб' });

        const message = await new Promise(resolve => getCurrentDuties({ reply: resolve }));
        expect(message).to.include(`В срок до ${weekAfter.format('L')} дежурят по кухне - Ёрш, по КВТ - Краб.`);

        await tableM3.delRow(1);
        await tableM3.delRow(0);
    });
});