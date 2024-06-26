"use strict";
const JWT = require("jsonwebtoken");

const HEADER = {
  AUTHORIZATION: "authorization",
  REFRESH_TOKEN: "x-rftoken-id",
};
const asyncHandler = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");

// service
const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // access token
    const accessToken = await JWT.sign(payload, publicKey, {
      // algorithm: "RS256",
      expiresIn: "2 days",
    });
    const refreshToken = await JWT.sign(payload, privateKey, {
      // algorithm: "RS256",
      expiresIn: "30 days",
    });
    //

    return { accessToken, refreshToken };
  } catch (error) {}
};
const generateAccessToken = async (payload, publicKey) => {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      // algorithm: "RS256",
      expiresIn: "2 days",
    });
    return { accessToken };
  } catch (e) {}
};
const authentication = asyncHandler(async (req, res, next) => {
  if (req.headers[HEADER.REFRESH_TOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESH_TOKEN];
      const decodeUser = await JWT.verify(
        refreshToken,
        process.env.PRIVATE_KEY
      );
      req.user = decodeUser;
      req.userProperty = decodeUser.userProperty;
      req.refreshToken = refreshToken;
      req.role = decodeUser.role;
      return next();
    } catch (e) {
      throw e;
    }
  }
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Vui lòng đăng nhập!!!");
  try {
    const decodeUser = await JWT.verify(accessToken, process.env.PUBLIC_KEY);
    req.user = decodeUser;
    req.userProperty = decodeUser.userProperty;
    req.role = decodeUser.role;
    req.headers.user = req.user.userId;
    return next();
  } catch (error) {
    throw error;
  }
});
const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};
module.exports = {
  createTokenPair,
  generateAccessToken,
  authentication,
  verifyJWT,
};

// "use strict";
// const JWT = require("jsonwebtoken");
// const asyncHandler = require("../helpers/asyncHandler");
// const { AuthFailureError, NotFoundError } = require("../core/error.response");
// // service
// const createTokenPair = async (payload, publicKey, privateKey) => {
//   try {
//     // // access token
//     // const accessToken = await JWT.sign(payload, publicKey, {
//     //   // algorithm: "RS256",
//     //   expiresIn: "2 days",
//     // });
//     // const refreshToken = await JWT.sign(payload, privateKey, {
//     //   // algorithm: "RS256",
//     //   expiresIn: "30 days",
//     // });
//     // //
//     res.cookie("accessToken", tokens.accessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production", // chỉ sử dụng https trong môi trường production
//       maxAge: 2 * 24 * 60 * 60 * 1000, // 2 ngày
//     });
//     res.cookie("refreshToken", tokens.refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
//     });
//     return { accessToken, refreshToken };
//   } catch (error) {}
// };
// const generateAccessToken = async (payload, publicKey) => {
//   try {
//     const accessToken = await JWT.sign(payload, publicKey, {
//       // algorithm: "RS256",
//       expiresIn: "2 days",
//     });
//     return { accessToken };
//   } catch (e) {}
// };
// const authentication = asyncHandler(async (req, res, next) => {
//   if (req.cookies.refreshToken) {
//     try {
//       const refreshToken = req.cookies.refreshToken;
//       const decodeUser = await JWT.verify(
//         refreshToken,
//         process.env.PRIVATE_KEY
//       );
//       req.user = decodeUser;
//       req.refreshToken = refreshToken;
//       req.role = decodeUser.role;
//       return next();
//     } catch (e) {
//       throw e;
//     }
//   }
//   const accessToken = req.cookies.accessToken;
//   if (!accessToken) throw new AuthFailureError("Vui lòng đăng nhập!!!");
//   try {
//     const decodeUser = await JWT.verify(accessToken, process.env.PUBLIC_KEY);
//     req.user = decodeUser;
//     req.role = decodeUser.role;
//     req.headers.user = req.user.userId;
//     return next();
//   } catch (error) {
//     throw error;
//   }
// });
// const verifyJWT = async (token, keySecret) => {
//   return await JWT.verify(token, keySecret);
// };
// module.exports = {
//   createTokenPair,
//   generateAccessToken,
//   authentication,
//   verifyJWT,
// };
