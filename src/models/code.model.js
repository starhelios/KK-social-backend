const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const secretCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now(),
    expires: 600,
  },
});

// add plugin that converts mongoose to json
secretCodeSchema.plugin(toJSON);
secretCodeSchema.plugin(paginate);

const Code = mongoose.model('Code', secretCodeSchema);

module.exports = Code;
