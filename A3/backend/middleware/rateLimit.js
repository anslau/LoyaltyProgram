const requests = new Map();

const rateLimit = (req, res, next) => {
    // get the user ip and the current time they're making the request
    const ip = req.ip;
    const now = Date.now();

    // check if the user has made more than one request in the last minute
    if (requests.has(ip)) {
        const lastRequest = requests.get(ip);
        const diff = now - lastRequest;

        // note the difference is in milliseconds
        if (diff < 60000) {
            return res.status(429).json({ message: "Too many requests, wait 60s" });
        }
    }else{
        requests.set(ip, now);
    }

    next();
};

module.exports = rateLimit;