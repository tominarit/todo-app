import express, { Response, Request } from "express";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express';
import { ENV } from "./config/env";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware())

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

app.listen(ENV.PORT, () => {
  console.log(`Server is running at http://localhost:${ENV.PORT}`);
});