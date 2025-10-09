import allowedOrigins from "./allowedOrigins.js";

const corsOptions = {
  origin: function (origin, cb) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      console.log(origin, "Success");
      cb(null, true);
    } else {
      console.log(origin, "Error");
      cb(new Error("Not allowed by Cors"));
    }
  },
  credentials: true,
};

export default corsOptions;
