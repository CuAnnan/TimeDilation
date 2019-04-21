const   Big = require('big-js'),
        C = new Big(299792458),
        C_SQUARED = C.pow(2),
        ONE = new Big(1);
module.exports = {
    C:C,
    C_SQUARED:C_SQUARED
};