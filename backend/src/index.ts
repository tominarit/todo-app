import express, { Response, Request } from "express";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express';
import { ENV } from "./config/env";
import todoRouter from "./routes/todoRoutes";
import userRouter from "./routes/userRoutes";
import { requireAuth } from "./middleware/requireAuth";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

app.get("/", (req: Request, res: Response) => {
    res.json(
        {
            message: "Welcome to Todo API - Powered by PostgreSQL, Drizzle ORM & Clerk Auth",
            endpoints: {
                users: "/api/users",
                todos: "/api/todos",
            },
        }
    );
});

app.use("/api/users", requireAuth, userRouter);
app.use("/api/todos", requireAuth, todoRouter);

app.listen(ENV.PORT, () => {
  console.log(`Server is running at http://localhost:${ENV.PORT}`);
});