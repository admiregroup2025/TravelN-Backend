import jwt from "jsonwebtoken";
import { ROLES } from "../constant.js";

export function requireAuth(req, res, next) {
	const header = req.headers.authorization || "";
	const token = header.startsWith("Bearer ") ? header.slice(7) : null;
	if (!token) return res.status(401).json({ message: "Unauthorized" });
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
		req.user = payload; // { id, role }
		return next();
	} catch (error) {
		return res.status(401).json({ message: "Invalid token" });
	}
}

export function requireRoles(...allowed) {
	return function (req, res, next) {
		if (!req.user) return res.status(401).json({ message: "Unauthorized" });
		if (!allowed.includes(req.user.role)) {
			return res.status(403).json({ message: "Forbidden" });
		}
		next();
	};
}

export const Roles = ROLES;


