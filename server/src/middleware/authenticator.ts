/**
 * Authenticate the token, used by any path that needs to be protected
 */
import webToken from "jsonwebtoken";
import {LOGIN_KEY} from "../controller/loginController";

interface AuthError extends Error {
    status?: number;
}

// Authenticate a request by checking if a token is included and correct
export const authenticateToken = (req, res, next) => {
  const token = req?.cookies?.token;
  if (token) {
    webToken.verify(token, LOGIN_KEY, function(err, decoded) {
      // the token is incorrect or expired
      if (err) {
        const wrongTokenError:AuthError = new Error("Invalid login state");
        wrongTokenError.status = 403;
        next(wrongTokenError);
      }
      // allow access
      else {
        req.user = decoded;
        next();
      }
    });
  }
  // token not found in the header
  else {
    const noTokenError:AuthError = new Error("Credentials not provided");
    noTokenError.status = 401;
    next(noTokenError);
  }
};
