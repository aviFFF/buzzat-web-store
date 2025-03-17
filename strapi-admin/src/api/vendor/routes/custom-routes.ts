/**
 * Custom vendor routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/vendors/pincode/:pincode',
      handler: 'vendor.findByPincode',
      config: {
        auth: false,
      },
    },
  ],
}; 