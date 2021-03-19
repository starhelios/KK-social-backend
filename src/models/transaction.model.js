const { string } = require('@hapi/joi');
const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const transactionSchema = mongoose.Schema(
  {
    stripeRawData: {
      type: Object,
    },
    total_amount_charged: {
      type: String,
    },
    application_fee_amount: {
      type: String,
    },
    stripeCustomerID: {
      type: String,
    },
    stripeConnectID: {
      type: String,
    },
    stripePaymentIntentID: {
      type: String,
      required: true,
      index: true,
    },
    purchaseUserID: {
      type: String,
      required: true,
    },
    hostUserID: {
      type: String,
      required: true,
    },
    experienceID: {
      type: String,
      required: true,
    },
    viewChargesURL: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
transactionSchema.plugin(toJSON);
transactionSchema.plugin(paginate);

transactionSchema.statics.isNameTaken = async function (stripePaymentIntentID, excludeTransactionId) {
  const transaction = await this.findOne({ stripePaymentIntentID, _id: { $ne: excludeTransactionId } });
  return !!transaction;
};

const Transaction = mongoose.model('Transactions', transactionSchema);

module.exports = Transaction;
