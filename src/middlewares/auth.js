// const jwt = require("jsonwebtoken");
// const SECRET_KEY = process.env.SECRET_KEY;

// const authMiddleware = (req, res, next) => {
//     try {
//         const authHeader = req.header("Authorization"); // Get Authorization header
//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return res.status(401).json({ message: "Access Denied: No Token Provided" });
//         }

//         const token = authHeader.split(" ")[1]; // Extract token after "Bearer"
//         // console.log("Extracted Token:", token); // Debugging

//         const decoded = jwt.verify(token, process.env.SECRET_KEY);
//         req.user = decoded; // Attach user object (decoded from token)
//         // console.log("Decoded User:", req.user); // Debugging

//         next(); // Move to next middleware/controller
//     } catch (error) {
//         console.error("Auth Middleware Error:", error);
//         res.status(401).json({ message: "Invalid or Expired Token" });
//     }
// };

// module.exports = authMiddleware;



const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.SECRET_KEY);
        req.userId = decoded.id; // ✅ Set req.userId
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;
