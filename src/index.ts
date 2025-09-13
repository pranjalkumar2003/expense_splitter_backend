import express,{Request, Response} from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/authentication";
import pool from "./database/pool-connect";
import groupRoutes from "./routes/groups";
import expensesRoutes from "./routes/expenses";
import balanceRoutes from "./routes/balance";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/start", (req: Request, res: Response) => {
  res.send("Expense Splitter API running 🚀");
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, ()=>{
     console.log(`Backend application running at port ${PORT} 🚀`);
});

app.use("/api/auth", routes);
app.use("/api/groups",groupRoutes);
app.use("/api/groups",expensesRoutes);
app.use("/api/balance", balanceRoutes);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL successfully!");

    const res = await client.query("SELECT NOW()");
    console.log("Server time:", res.rows[0]);
  } catch (err) {
    console.error("❌ Database connection error:", err);
  }
})();