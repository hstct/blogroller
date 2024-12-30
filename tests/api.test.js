import { fetchSubscriptions } from '../src/api/api.js';

describe('fetchSubscriptions', () => {
    it('should throw an error if required parameters are missing', async () => {
        await expect(fetchSubscriptions({ subscriptionUrl: '' }, ''))
            .rejects.toThrow("Both 'subscriptionUrl' and 'categoryLabel' are required");
    });
});
