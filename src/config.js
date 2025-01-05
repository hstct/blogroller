export const CONFIG = {
  defaults: {
    documentClass: 'blogroll',
    subscriptionEndpoint: 'subscriptions',
    batchSize: 10,
  },
  validation: {
    requiredParams: ['proxyUrl', 'categoryLabel'],
  },
};
