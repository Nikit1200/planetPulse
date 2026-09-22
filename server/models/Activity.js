const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Activity type is required'],
      enum: {
        values: ['travel', 'bus', 'flight', 'electricity', 'veg_meal', 'nonveg_meal'],
        message: '{VALUE} is not a valid activity type'
      },
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      validate: {
        validator: function (v) {
          return typeof v === 'number' && Number.isFinite(v) && v > 0;
        },
        message: 'Quantity must be a valid, finite number greater than zero'
      }
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true
    },
    co2: {
      type: Number,
      required: [true, 'CO2 emission value is required'],
      validate: {
        validator: function (v) {
          return typeof v === 'number' && Number.isFinite(v) && v >= 0;
        },
        message: 'CO2 must be a valid, finite number that is not negative'
      }
    },
    date: {
      type: Date,
      required: [true, 'Activity date is required'],
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for optimal queries and sorting
activitySchema.index({ date: -1, createdAt: -1 });
activitySchema.index({ type: 1, date: -1 });

module.exports = mongoose.model('Activity', activitySchema);
