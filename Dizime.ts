import express from "express";
import https from "https";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import path from "path";
import Logger from "./logger";
import fs from "fs";
import { Server } from "http";
import ExpressWs from "express-ws";

export class Dizime {
  public app: ExpressWs.Application;
  private readonly __dirname = path.resolve();
  private readonly logger = new Logger("Dizime");
  public server?: Server;
  public sslServer?: https.Server;
  public expressWs: ExpressWs.Instance;
  private readonly ssl: boolean = false;
  private stopping: boolean = false;
  constructor() {
    this.app = express() as unknown as ExpressWs.Application;
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use("/assets", express.static("./client-dist/assets"));
    this.app.disable("x-powered-by");
    this.app.use("/config", express.static("config"));
    mongoose.set("strictQuery", true);
    if (process.env.SSL_KEY && process.env.SSL_CERT) {
      this.sslServer = https.createServer({
        key: fs.readFileSync(process.env.SSL_KEY),
        cert: fs.readFileSync(process.env.SSL_CERT),
      }, this.app);
      this.expressWs = ExpressWs(this.app, this.sslServer);
      this.ssl = true;
    } else {
      this.ssl = false;
      this.expressWs = ExpressWs(this.app);
    }
  }
  async start() {
    this.logger.info("Starting server...");
    if (!fs.existsSync("./config/hcaptcha.json")) {
      this.logger.error("hCaptcha config file not found");
      process.exit(1);
    }
    if (!process.env.MONGODB_URI) {
      this.logger.error("MONGODB_URI not found");
      process.exit(1);
    }
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => this.logger.success("Connected to MongoDB"))
      .catch((err) => {
        this.logger.error("Failed to connect to MongoDB");
        this.logger.error(err);
        process.exit(1);
      });

    this.app.use("/api", (await import("./api")).default);
    this.app.use("/gateway", (await import("./api/gateway")).default);

    this.app.use((req, res, next) => {
      if (req.path === "/login" || req.path === "/signup") {
        if (req.cookies.token) {
          res.redirect("/app");
        } else {
          next();
        }
      } else if (req.path === "/app") {
        if (!req.cookies.token) {
          res.redirect("/login");
        } else {
          next();
        }
      } else {
        next();
      }
    })
    this.app.use((req, res) => {
      res.sendFile("./client-dist/index.html", { root: this.__dirname });
    });

    this.server = this.app.listen(80, () => {
      this.logger.success("Server started on port 80");
    });
    if (this.ssl) {
      this.sslServer?.listen(443, () => {
        this.logger.success("Server started on port 443");
      });
    }
  }
  async stop() {
    if (this.stopping) {
      this.logger.warning("Server is already stopping");
      await new Promise(() => {});
    }
    this.stopping = true;
    this.logger.info("Stopping server...");
    await mongoose.disconnect();
    this.logger.success("Disconnected from MongoDB");
    this.server?.close();
    this.logger.success("Server stopped");
    if (this.ssl) {
      this.sslServer?.close();
      this.logger.success("SSL Server stopped");
    }
    this.logger.success("Dizime stopped. Goodbye!");
  }
}