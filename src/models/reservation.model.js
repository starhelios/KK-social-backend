const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const reservationSchema = mongoose.Schema({
  specificExperience: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Specific Experience',
    required: true,
  },
  guestList: {
    type: Array,
  },
  numberOfGuests: {
    type: Number,
  },
});

// add plugin that converts mongoose to json
reservationSchema.plugin(toJSON);
reservationSchema.plugin(paginate);

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
