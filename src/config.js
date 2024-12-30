export const CONFIG = {
    defaults: {
        documentClass: 'blogroll',
        subscriptionEndpoint: 'subscription/list',
        feedEndpoint: 'stream/contents',
        batchSize: 10,
    },
    validation: {
        requiredParams: ['proxyUrl', 'categoryLabel'],
    },
}
