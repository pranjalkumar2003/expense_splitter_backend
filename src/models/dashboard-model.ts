import pool from "database/pool-connect";


export const dashboard = async (id:any)=>{
   const result =  await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0];
}