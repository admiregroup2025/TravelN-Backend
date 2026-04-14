import allowedOrigins from "./allowedOrigins.js";

const corsOptions = {
  origin: "http://localhost:5173", // Your Frontend
  credentials: true,               // Required for cookies/headers
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"] // 👈 CRITICAL: Must allow Authorization
};


export default corsOptions;
