import { rateLimit } from "express-rate-limit"

export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 30,

  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
})
