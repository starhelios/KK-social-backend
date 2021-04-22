export const whitelistDev = ['http://localhost:3000', 'http://localhost:5000'];
export const whitelistProd = [
  'https://kloutkast.herokuapp.com/',
  'https://kloutkast-zoom.herokuapp.com/',
  'https://kloutkast.com/',
  'https://kloutkast-zoom.herokuapp.com',
];
export const corsOptions = {
  origin: function (origin, callback) {
    if (process.env.NODE_ENV !== 'production' && whitelistDev.indexOf(origin) !== -1) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'production' && whitelistProd.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
