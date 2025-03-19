/**
 * vendor router
 */

import { factories } from '@strapi/strapi';

// Just export the default router with public access
export default factories.createCoreRouter('api::vendor.vendor', {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
  // Define custom routes in a separate file or follow Strapi's routing conventions.
});
