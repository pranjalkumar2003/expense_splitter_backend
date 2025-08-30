import { AuthRequest } from "../middleware/auth";
import { Request, Response } from "express";
import {
  createGroup,
  getAllGroups,
  getGroupById,
} from "../models/group-model";

//#region Create Group
export const createGroupController = async (
  req: AuthRequest,
  res: Response
) => {
  const { name, group_size, purpose } = req.body;

  const created_by = req?.user?.email;

  if (!name || !group_size || !purpose) {
    return res.status(400).send("name or created_by feild is missing");
  }

  try {
    const group = await createGroup(name, created_by!, group_size, purpose);
    res.status(201).json(group);
  } catch (error) {
    res.status(500).send({
      message: "Something went wrong. Please try again later!",
      error: error,
    });
  }
};

// #region Get All groups
export const getAllGroupsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const result = await getAllGroups();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again later!");
  }
};

//#region Get Group By Id
export const getGroupByIdControllers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await getGroupById(id);

    if (result.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
