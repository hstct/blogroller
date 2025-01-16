interface BlogrollDefaults {
  documentClass: string;
  batchSize: number;
}

interface BlogrollValidation {
  requiredParams: string[];
}

export interface BlogrollConfig {
  defaults: BlogrollDefaults;
  validation: BlogrollValidation;
}

export const CONFIG: BlogrollConfig = {
  defaults: {
    documentClass: 'blogroll',
    batchSize: 10,
  },
  validation: {
    requiredParams: ['proxyUrl', 'categoryLabel'],
  },
};
