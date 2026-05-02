const required = (name, value) => {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
};

function getEnv() {
  return {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT || 3000),
    baseUrl: process.env.BASE_URL || "http://localhost:3000",

    mongodbUri: required("MONGODB_URI", process.env.MONGODB_URI),

    jwt: {
      secret: required("JWT_SECRET", process.env.JWT_SECRET),
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },
  };
}

module.exports = { getEnv };

