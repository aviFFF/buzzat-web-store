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
    {
      method: 'POST', // Ensure no duplicate 'method' properties exist in the same object
      path: '/vendor-auth/login',
      handler: 'vendor.login',
      config: {
        auth: false,
      },
    },
  ],
}; 