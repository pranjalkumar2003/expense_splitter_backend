import { Response } from "express";
import { AuthRequest } from "middleware/auth";
import { dashboard } from "models/dashboard-model";

export const dashboardController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const result = await dashboard(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
