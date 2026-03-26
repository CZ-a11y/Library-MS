import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token)
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });

    // Use jwt.verify directly from the default import
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Token is not valid" });
  }
};

export default auth;
