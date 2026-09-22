const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    weeklyTarget: {
      type: Number,
      required: [true, 'Weekly target is required'],
      default: 20,
      validate: {
        validator: function (v) {
          return typeof v === 'number' && Number.isFinite(v) && v > 0;
        },
        message: 'Weekly target must be a valid, finite number greater than zero'
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Settings', settingsSchema);
