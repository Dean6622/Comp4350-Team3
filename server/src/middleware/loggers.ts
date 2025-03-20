import debug from "debug";

// log the received request
const serverLog = debug("server:request");
export const requestLog = (req, res, next) => {
  console.log("run");
  serverLog(
    `${req.method} from ${req.protocol}://${req.get("host")}${req.originalUrl} body ${JSON.stringify(req.body)}`,
  );
  next();
};

