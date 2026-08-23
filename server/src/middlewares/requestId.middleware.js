import crypto from "crypto";

const requestId = (req, res, next) => {
    const id = crypto.randomUUID();

    req.requestId = id;
    res.setHeader("X-Request-ID", id);

    next();
};

export default requestId;