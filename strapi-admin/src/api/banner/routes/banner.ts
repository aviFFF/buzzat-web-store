/**
 * banner router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::banner.banner', {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
