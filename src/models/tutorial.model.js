const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const tutorialSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
tutorialSchema.plugin(toJSON);
tutorialSchema.plugin(paginate);

const Tutorial = mongoose.model('Tutorial', tutorialSchema);

module.exports = Tutorial;
