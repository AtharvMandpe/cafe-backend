// import mongoose, { Schema } from "mongoose";

// const MenuItemSchema = new Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       default: "",
//     },
//     price: {
//       type: Number,
//       // required: true,
//       min: 0,
//     },
//     sizeOptions: {
//       type: [
//         {
//           size: String,
//           price: Number,
//         },
//       ],
//       default: [],
//     },
//     imageUrl: {
//       type: String,
//       default: "",
//     },
//     category: {
//       type: String,
//       required: true,
//       enum: [
//         "Flavours of Coffee",
//         "Frappe",
//         "Mystic Mocktails",
//         "Lemon Twist",
//         "Ice Tea On The Rock",
//         "Pizza On Fire",
//         "Appetizers",
//         "Forever French Fries",
//         "Born For Burgers",
//         "Wrap",
//         "Soulmate Sandwich",
//         "Creamy Pasta",
//       ],
//     },
//     isSpecial: {
//       type: Boolean,
//       default: false,
//     },
//     isHealthy: {
//       type: Boolean,
//       default: false,
//     },
//     available: {
//       type: Boolean,
//       default: true,
//     },
//     ingredients: {
//       type: [String],
//       default: [],
//     },
//   },
//   { timestamps: true }
// );
// MenuItemSchema.pre("validate", function (next) {
//   const hasPrice = typeof this.price === "number";
//   const hasSizeOptions =
//     Array.isArray(this.sizeOptions) && this.sizeOptions.length > 0;

//   if ((hasPrice && hasSizeOptions) || (!hasPrice && !hasSizeOptions)) {
//     this.invalidate(
//       "price",
//       "You must provide **either** price **or** sizeOptions, but not both."
//     );
//   }

//   next();
// });

// const MenuItem = mongoose.model("MenuItem", MenuItemSchema);
// export default MenuItem;


import mongoose, { Schema } from "mongoose";

const MenuItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, min: 0 },
    sizeOptions: {
      type: [
        {
          size: String,
          price: Number,
        },
      ],
      default: [],
    },
    imageUrl: { type: String, default: "" },
    category: {
      type: String,
      required: true,
      enum: [
        "Flavours of Coffee",
        "Frappe",
        "Mystic Mocktails",
        "Lemon Twist",
        "Ice Tea On The Rock",
        "Pizza On Fire",
        "Appetizers",
        "Forever French Fries",
        "Born For Burgers",
        "Wrap",
        "Soulmate Sandwich",
        "Creamy Pasta",
      ],
    },
    isSpecial: { type: Boolean, default: false },
    isHealthy: { type: Boolean, default: false },
    available: { type: Boolean, default: true },
    ingredients: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Enforce price XOR sizeOptions
MenuItemSchema.pre("validate", function (next) {
  const hasPrice = typeof this.price === "number";
  const hasSizeOptions =
    Array.isArray(this.sizeOptions) && this.sizeOptions.length > 0;

  if ((hasPrice && hasSizeOptions) || (!hasPrice && !hasSizeOptions)) {
    this.invalidate(
      "price",
      "You must provide either price or sizeOptions, but not both."
    );
  }

  next();
});

// ✅ Add this to include id in the API response
MenuItemSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

const MenuItem = mongoose.model("MenuItem", MenuItemSchema);
export default MenuItem;
