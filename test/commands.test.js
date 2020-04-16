const { expect } = require('chai');
const { getCurrentDuties } = require('../commands');

describe('Test getCurrentDuties command.', () => {
    it('should say: В срок дежурят...', async () => {
        const message = await new Promise(resolve => getCurrentDuties({ reply: resolve }));
        expect(message).to.be.equal('В срок до 19.04.2020 дежурят по кухне - Ксюша, по КВТ - Денис');
    });
});