import jwt from "jsonwebtoken";

export const isAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "No estas autorizado",
    });
  }

  jwt.verify(token, "xyz123", (err, decoded) => {
    if (err)
      return res.status(401).json({
        message: "No estas autorizado",
      });

    req.userId = decoded.id; 
    req.rol = decoded.rol;
    req.id_contratista = decoded.id_contratista;
    req.slug_contratista = decoded.slug_contratista;

    next();
  });
};