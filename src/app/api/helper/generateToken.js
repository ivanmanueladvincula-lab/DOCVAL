import jwt from "jsonwebtoken";

const gen_refresh_JWT = (data) => {
  const payload = {
    uid: data.id,
    eml: data.email,
    rol: data.role,
  };
  const secret = process.env.JWT_SECRET;

  const token = jwt.sign(payload, secret, {
    expiresIn: "7d",
    issuer: "docval_api_js",
  });

  return token;
};

const gen_access_JWT = (data) => {
  const payload = {
    uid: data.id,
    eml: data.email,
    rol: data.role,
  };
  const secret = process.env.JWT_SECRET;
  const token = jwt.sign(payload, secret, {
    expiresIn: "15m",
    issuer: "docval_api_js",
  });
  return token;
};

export { gen_access_JWT, gen_refresh_JWT };
