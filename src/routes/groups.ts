import pool from "../database/pool-connect.js";
import { Router, Request, Response } from "express";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { name, created_by } = req.body;

  if (!name || !created_by) {
    return res.status(400).send("name or created_by feild is missing");
  }

  try {
    const result = await pool.query(
      "INSERT INTO groups (name, created_by) VALUES ($1, $2) RETURNING *",
      [name, created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send({message:"Something went wrong. Please try again later!", error: error});
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const result=await pool.query("SELECT * FROM groups ORDER BY created_by DESC");
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again later!");
  }
});

// Get group by id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM groups WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
