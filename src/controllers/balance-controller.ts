import { Request, Response } from "express";
import { getGroupMembers, getGroupExpenses } from "../models/balance-model";
import { AuthRequest } from "../middleware/auth";

/**
 * Returns raw balances per member in a group:
 * [{ user_id, user_name, paid, share, balance }]
 */
export const getRawBalances = async (req: AuthRequest, res: Response) => {
  const groupId = Number(req.params.groupId);
  try {
    const members = await getGroupMembers(groupId);
    if (members.length === 0) return res.status(200).json([]);

    const expenses = await getGroupExpenses(groupId);

    // initialize map
    const map: Record<number, { user_id:number; user_name:string; paid:number; share:number }> = {};
    members.forEach(m => {
      map[m.user_id] = { user_id: m.user_id, user_name: m.user_name, paid: 0, share: 0 };
    });

    // calculate paid and share
    for (const e of expenses) {
      const share = e.paid_amount / members.length;
      // add paid
      if (!map[e.member_id]) {
        // expense paid by someone not in members list (edge case) -> add them
        map[e.member_id] = { user_id: e.member_id, user_name: `user_${e.member_id}`, paid: e.paid_amount, share };
      } else {
        map[e.member_id].paid += Number(e.paid_amount);
      }
      // add share for every member
      for (const m of members) {
        map[m.user_id].share += Number(share);
      }
    }

    const result = Object.values(map).map(v => ({
      user_id: v.user_id,
      user_name: v.user_name,
      paid: Number(v.paid.toFixed(2)),
      share: Number(v.share.toFixed(2)),
      balance: Number((v.paid - v.share).toFixed(2))
    }));

    res.json(result);
  } catch (err:any) {
    console.error("getRawBalances:", err);
    res.status(500).json({ error: "Failed to compute balances" });
  }
};

/**
 * Returns settlement-friendly list:
 * [{ from, to, amount }]
 */
export const getSettlements = async (req: AuthRequest, res: Response) => {
  const groupId = Number(req.params.groupId);
  try {
    const raw = await (await import("../controllers/balance-controller")).getRawBalancesInternal(groupId);
    // raw: array of { user_id, user_name, balance }

    const creditors = raw.filter((r:any)=> r.balance > 0).map(r=>({...r}));
    const debtors = raw.filter((r:any)=> r.balance < 0).map(r=>({...r}));

    // sort for deterministic behavior
    creditors.sort((a:any,b:any)=> b.balance - a.balance);
    debtors.sort((a:any,b:any)=> a.balance - b.balance);

    const settlements:any[] = [];
    let i=0, j=0;
    while(i<debtors.length && j<creditors.length){
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amt = Math.min( Math.abs(debtor.balance), creditor.balance );
      if (amt <= 0) break;

      settlements.push({
        from: debtor.user_name,
        to: creditor.user_name,
        amount: Number(amt.toFixed(2))
      });

      debtor.balance += amt;
      creditor.balance -= amt;

      if (Math.abs(debtor.balance) < 0.01) i++;
      if (creditor.balance < 0.01) j++;
    }

    res.json(settlements);
  } catch (err:any) {
    console.error("getSettlements:", err);
    res.status(500).json({ error: "Failed to compute settlements" });
  }
};

/**
 * Internal helper used by both controllers — returns simplified raw balances array.
 */
export const getRawBalancesInternal = async (groupId:number) => {
  const members = await getGroupMembers(groupId);
  if (members.length === 0) return [];

  const expenses = await getGroupExpenses(groupId);

  const map: Record<number, { user_id:number; user_name:string; paid:number; share:number }> = {};
  members.forEach(m => {
    map[m.user_id] = { user_id: m.user_id, user_name: m.user_name, paid: 0, share: 0 };
  });

  for (const e of expenses) {
    const share = e.paid_amount / members.length;
    if (!map[e.member_id]) {
      map[e.member_id] = { user_id: e.member_id, user_name: `user_${e.member_id}`, paid: e.paid_amount, share };
    } else {
      map[e.member_id].paid += Number(e.paid_amount);
    }
    for (const m of members) {
      map[m.user_id].share += Number(share);
    }
  }

  const result = Object.values(map).map(v => ({
    user_id: v.user_id,
    user_name: v.user_name,
    paid: Number(v.paid.toFixed(2)),
    share: Number(v.share.toFixed(2)),
    balance: Number((v.paid - v.share).toFixed(2))
  }));

  return result;
};
