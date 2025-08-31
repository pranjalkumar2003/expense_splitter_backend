import { AuthRequest } from "../middleware/auth";
import { Request, Response } from "express";
import {
  addGroupMembers,
  createGroup,
  getAllGroupMember,
  getAllGroups,
  getGroupById,
  getGroupByName,
  getGroupMemberById,
  getGroupMemberByName,
} from "../models/group-model";

import { getUserByEmail, getUserById } from "../models/authenication-model";

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
    res.status(500).json({
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
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later!" });
  }
};

//#region Get Group By Id
export const getGroupByIdControllers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await getGroupById(id);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

//#region Group Member Controllers

export const AddGroupMemberController = async (
  req: AuthRequest,
  res: Response
) => {
  const { idOrName } = req.params;
  const { user_id, user_email } = req.body;
  try {
    if (!idOrName) {
      return res.status(400).send("Please provide a group id or group name");
    }
    if (!user_id && !user_email) {
      return res.status(400).send("Please provide a user id or user email");
    }

    let isGroupExist;
    if (/^\d+$/.test(idOrName)) {
      // numeric → group_id
      isGroupExist = await getGroupById(Number(idOrName));
    } else {
      // non-numeric → group_name
      isGroupExist = await getGroupByName(idOrName);
    }

    if (isGroupExist.rows.length === 0) {
      return res.status(400).json({
        error: "Group doesn't exists. Please Enter valid group name or id",
      });
    }

    let isUserExist;
    if (user_id) {
      isUserExist = await getUserById(user_id);
    } else if (user_email) {
      isUserExist = await getUserByEmail(user_email);
    }
    if (isUserExist!.rows.length === 0) {
      return res.status(400).json({
        error: "User doesn't exists. Please Enter valid user email or id",
      });
    }
    const result = await addGroupMembers(
      isGroupExist.rows[0].id,
      isUserExist!.rows[0].id,
      isGroupExist.rows[0].name,
      isUserExist!.rows[0].name,
      isUserExist!.rows[0].email
    );
    if (result.rowCount && result.rowCount > 0) {
      res.status(201).json({ message: "Member Added Suceessfully"});
    } else {
      res.status(400).json({ error: "Something went wrong. Please try again later!" });
    }
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "User already in group" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllGroupMemberController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const result = await getAllGroupMember();

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Groups Members not found" });
    }

    res.status(200).send(result.rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later!" });
  }
};

export const getGroupMemberController = async (
  req: AuthRequest,
  res: Response
) => {
  const { idOrName } = req.params;

  try {
    if (!idOrName) {
      return res.status(400).send("Please provide a group id or group name");
    }

    let result;
    if (/^\d+$/.test(idOrName)) {
      // numeric → group_id
      result = await getGroupMemberById(Number(idOrName));
    } else {
      // non-numeric → group_name
      result = await getGroupMemberByName(idOrName);
    }

    if (result.rows.length === 0) {
      return res.status(200).send("No Members added Yet");
    }

    res.status(200).send(result.rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later!" });
  }
};
